import { SQSEvent } from 'aws-lambda';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

// Pinecone setup
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });

export const handler = async (
  event: SQSEvent
): Promise<{ statusCode: number; body: string }> => {
  for (const record of event.Records) {
    try {
      const { conversationId } = JSON.parse(record.body);

      // Delete data associated with conversationId in Pinecone
      await pineconeStore.delete({
        filter: {
          conversationId,
        },
      });

      console.log(`Deleted conversation data for: ${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation data:', error);
      throw error;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Deletion process complete' }),
  };
};
