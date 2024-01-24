import { Pinecone, Index } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore, PineconeStoreParams } from '@langchain/pinecone';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import ConversationModel from '@/model/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

// Instantiate a new Pinecone client
const pinecone = new Pinecone();

// Ensure pineconeIndex is of the correct type
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OpenAIEmbeddings();
const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });


/**
 * Handle POST requests to /api/pinecone
 * @param {Request} request - The incoming POST request
 * @returns {Response} - The response indicating success or failure
 */
export async function POST(request: Request) {
  let newConversation = null;

  try {
    await dbConnect();
    const { markdown, blogUrl } = await request.json();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    newConversation = await ConversationModel.create({
      userId: user._id,
      blogUrl,
      markdown,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 1,
    });

    const docOutput = await splitter.splitDocuments([
      new Document({
        pageContent: markdown,
        metadata: {
          conversationId: newConversation._id.toString(),
        },
      }),
    ]);

    console.log('Received message:', docOutput);

    await PineconeStore.fromDocuments(docOutput, new OpenAIEmbeddings(), {
      pineconeIndex,
      maxConcurrency: 5,
    });

    return Response.json(
      {
        success: true,
        message: 'Message received, processed, and stored in Pinecone',
        conversationId: newConversation._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing message:', error);

    // Delete the created conversation in MongoDB
    if (newConversation && newConversation._id) {
      await ConversationModel.findByIdAndDelete(newConversation._id);
    }

    // Delete associated data in Pinecone
    if (newConversation && newConversation._id) {
      await pineconeStore.delete(
        {
        filter: {
          conversationId: newConversation._id.toString(),
        },
      });
    }

    return Response.json(
      { success: false, message: 'Error processing message' },
      { status: 500 }
    );
  }
}
