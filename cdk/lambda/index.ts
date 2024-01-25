import { SQSEvent } from 'aws-lambda';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

// Pinecone and LangChain setup
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const pineconeStore = new PineconeStore(embeddings, { pineconeIndex });

export const handler = async (
  event: SQSEvent
): Promise<{ statusCode: number; body: string }> => {
  let errorOccurred = false;
  let errorConversationId = null;

  for (const record of event.Records) {
    try {
      const { markdown, conversationId } = JSON.parse(record.body);
      errorConversationId = conversationId; // Store the conversationId for error handling

      // Process the markdown
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 1,
      });
      const docOutput = await splitter.splitDocuments([
        new LangChainDocument({
          pageContent: markdown,
          metadata: { conversationId },
        }),
      ]);

      // Store in Pinecone
      await PineconeStore.fromDocuments(docOutput, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
      });

      console.log(`Processed conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error processing message:', error);
      errorOccurred = true;
      break; // Stop processing further records after an error
    }
  }

  if (errorOccurred && errorConversationId) {
    // Delete associated data in Pinecone if an error occurred
    await pineconeStore.delete({
      filter: {
        conversationId: errorConversationId,
      },
    });
    throw new Error(`Error processing conversationId: ${errorConversationId}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Processing complete' }),
  };
};
