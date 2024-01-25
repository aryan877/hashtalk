import { Pinecone, Index } from '@pinecone-database/pinecone';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';
import ConversationModel from '@/model/Conversation';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore, PineconeStoreParams } from '@langchain/pinecone';

// Instantiate a new Pinecone client
const pinecone = new Pinecone();

// Ensure pineconeIndex is of the correct type
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OpenAIEmbeddings();
const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const chatId = params.id;
  await dbConnect();

  // Authenticate the user
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  if (!session || !_user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    // Delete chat from MongoDB
    const deletedChat = await ConversationModel.findByIdAndDelete(chatId);
    if (!deletedChat) {
      return new Response(
        JSON.stringify({ success: false, message: 'Chat not found' }),
        { status: 404 }
      );
    }

   await pineconeStore.delete({
      filter: {
        conversationId: chatId,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Chat deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error processing request' }),
      { status: 500 }
    );
  }
}
