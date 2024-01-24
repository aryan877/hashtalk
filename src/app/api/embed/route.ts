
import { Pinecone, Index } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore, PineconeStoreParams } from '@langchain/pinecone';

// Instantiate a new Pinecone client
const pinecone = new Pinecone();

// Ensure pineconeIndex is of the correct type
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

/**
 * Handle POST requests to /api/pinecone
 * @param {Request} request - The incoming POST request
 * @returns {Response} - The response indicating success or failure
 */
export async function POST(request: Request) {
  try {
    // Parse the incoming request body to extract the message
    const { message } = await request.json();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 1,
    });

    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: message, metadata: {
        conversationId: 'abcd'
      } }),
    ]);

    console.log('Received message:', docOutput);

    // Process the document output with Pinecone
    await PineconeStore.fromDocuments(docOutput, new OpenAIEmbeddings(), {
      pineconeIndex,
      maxConcurrency: 5,
    });

    // Respond with a success message
    return Response.json(
      {
        success: true,
        message: 'Message received, processed, and stored in Pinecone',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing message:', error);
    return Response.json(
      { success: false, message: 'Error processing message' },
      { status: 500 }
    );
  }
}
