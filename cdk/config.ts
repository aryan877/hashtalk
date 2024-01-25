import * as dotenv from 'dotenv';
import path = require('path');

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define a type for the configuration properties
export type ConfigProps = {
  AWS_ACCOUNT: string;
  AWS_REGION: string;
  PINECONE_API_KEY: string;
  PINECONE_INDEX: string;
  PINECONE_ENVIRONMENT: string;
  MONGODB_URI: string;
  OPENAI_API_KEY: string;
};

// Function to get the configuration from environment variables
export const getConfig = (): ConfigProps => ({
  AWS_ACCOUNT: process.env.AWS_ACCOUNT as string,
  AWS_REGION: process.env.AWS_REGION as string,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY as string,
  PINECONE_INDEX: process.env.PINECONE_INDEX as string,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
});