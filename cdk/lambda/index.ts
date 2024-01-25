import { SQSEvent } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import { Pinecone, Index } from '@pinecone-database/pinecone';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI as string;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI as string);
  const db = await client.db('');
  cachedDb = db;
  return db;
}

// Other service setup (Pinecone, LangChain, etc.)
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });

export const handler = async (
  event: SQSEvent
): Promise<{ statusCode: number; body: string }> => {
  const db = await connectToDatabase();

  for (const record of event.Records) {
    let newConversationId = null;
    try {
      const {
        markdown,
        blogUrl,
        blogTitle,
        blogSubtitle,
        blogPublishDate,
        userId,
      } = JSON.parse(record.body);

      // Insert into MongoDB
      const conversation = {
        userId,
        blogUrl,
        blogTitle,
        blogSubtitle,
        blogPublishDate,
        markdown,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db
        .collection('conversations')
        .insertOne(conversation);
      newConversationId = result.insertedId;

      // Process the markdown (using LangChain)
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 1,
      });
      const docOutput = await splitter.splitDocuments([
        new LangChainDocument({
          pageContent: markdown,
          metadata: {
            conversationId: newConversationId.toString(),
          },
        }),
      ]);

      // Store in Pinecone
      await PineconeStore.fromDocuments(docOutput, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
      });

      console.log(`Processed conversation: ${newConversationId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Successfully processed conversation: ${newConversationId}`,
        }),
      };
    } catch (error) {
      console.error('Error processing message:', error);

      // Cleanup in case of an error
      if (newConversationId) {
        // Delete the created conversation in MongoDB
        await db
          .collection('conversations')
          .deleteOne({ _id: newConversationId });

        // Delete associated data in Pinecone
        await pineconeStore.delete({
          filter: {
            conversationId: newConversationId.toString(),
          },
        });
      }

      // Re-throw the error for Lambda's error handling
      throw error;
    }
  }
  // Return a default response if no records are processed
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'No records to process' }),
  };
};
