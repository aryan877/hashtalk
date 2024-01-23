import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

// Instantiate a new Pinecone client
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

// Predefined set of documents for demonstration purposes
const dummyDocs = [
  new Document({
    metadata: { foo: 'bar' },
    pageContent: 'pinecone is a vector db',
  }),
  new Document({
    metadata: { foo: 'bar' },
    pageContent: 'the quick brown fox jumped over the lazy dog',
  }),
  new Document({
    metadata: { baz: 'qux' },
    pageContent: 'lorem ipsum dolor sit amet',
  }),
  new Document({
    metadata: { baz: 'qux' },
    pageContent: 'pinecones are the woody fruiting body of a pine tree',
  }),
];

/**
 * Handle POST requests to /api/pinecone
 * @param {Request} request - The incoming POST request
 * @returns {Response} - The response indicating success or failure
 */
export async function POST(request: Request) {
  try {
    await PineconeStore.fromDocuments(dummyDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
      maxConcurrency: 5,
    });

    return Response.json(
      { success: true, message: 'Dummy documents added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding dummy documents:', error);
    return Response.json(
      { success: false, message: 'Error adding dummy documents' },
      { status: 500 }
    );
  }
}