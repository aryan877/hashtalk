import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import { authOptions } from '../../auth/[...nextauth]/options';
import { getServerSession } from 'next-auth/next';
import { MongoClient, ObjectId } from 'mongodb';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import MessageModel from '@/model/Message';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import ConversationModel from '@/model/Conversation';

// Pinecone client initialization
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

/**
 * Handle POST requests to /api/vectorSearch
 * @param {Request} request - The incoming POST request
 * @returns {Response} - The response indicating success or failure
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    await dbConnect();

    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    });

    // Session verification
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify if the conversation belongs to the user
    const conversationExists = await ConversationModel.findOne({
      _id: new ObjectId(conversationId),
      userId: user._id,
    });

    if (!conversationExists) {
      return Response.json(
        { success: false, message: 'Conversation not found or access denied' },
        { status: 403 } // 403 Forbidden
      );
    }

    const { userMessage } = await request.json();

    // Save the user's message
    const userMessageDoc = new MessageModel({
      userId: user._id,
      conversationId: new ObjectId(conversationId),
      message: userMessage,
      messageType: 'human',
    });
    await userMessageDoc.save();

    // Retrieve all messages for this conversation
    const messages = await MessageModel.find({
      conversationId: new ObjectId(conversationId),
    });

    // Build chat history from retrieved messages
    const chatHistory = messages.map((msg) =>
      msg.messageType === 'human'
        ? new HumanMessage(msg.message)
        : new AIMessage(msg.message)
    );

    // Instantiate the vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
        filter: {
          conversationId: conversationId,
        },
      }
    );

    const retriever = vectorStore.asRetriever();

    const conversationalRetrievalChain = await setupHistoryAwareRetrievalChain(
      model,
      retriever
    );

    // Using the conversational retrieval chain for the follow-up question
    const followUpResult = await conversationalRetrievalChain.invoke({
      chat_history: chatHistory,
      input: userMessage,
    });

    // Save AI's response
    const aiMessageDoc = new MessageModel({
      userId: user._id,
      conversationId: new ObjectId(conversationId),
      message: followUpResult.answer,
      messageType: 'ai',
    });
    await aiMessageDoc.save();

    // Return the results
    return Response.json(
      {
        success: true,
        message: aiMessageDoc,
        // results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in vector search:', error);
    return Response.json(
      { success: false, message: 'Error during ai message generation' },
      { status: 500 }
    );
  }
}

async function setupHistoryAwareRetrievalChain(
  chatModel: ChatOpenAI,
  retriever: VectorStoreRetriever<PineconeStore>
) {
  // Define a prompt that incorporates the entire conversation history. This is used to generate contextually relevant search queries.
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
    [
      'user',
      'Generate a search query based on the conversation to find relevant information.',
    ],
  ]);

  // Create a history-aware retriever chain. This chain takes the full conversation history into account when fetching documents,
  // ensuring that the search query is relevant to the entire conversation, not just the latest input.
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: chatModel,
    retriever: retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // Define a prompt for combining the retrieved documents with the full conversation history for the final response generation.
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ]);

  // Create a document chain that combines the retrieved documents with the conversation history, allowing the LLM to generate context-aware responses.
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt: historyAwareRetrievalPrompt,
  });

  // Return the complete retrieval chain that combines document retrieval with LLM processing for conversational context.
  return await createRetrievalChain({
    combineDocsChain: historyAwareCombineDocsChain,
    retriever: historyAwareRetrieverChain,
  });
}

// export async function POST(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const conversationId = params.id;
//     await dbConnect();

//     const model = new ChatOpenAI({
//       modelName: 'gpt-3.5-turbo',
//       temperature: 0,
//     });

//     // Extract parameters from request
//     // const { userMessage } = await request.json();

//     // Session verification
//     // const session = await getServerSession(authOptions);
//     // const user: User = session?.user;
//     // if (!session || !user) {
//     //   return Response.json(
//     //     { success: false, message: 'Not authenticated' },
//     //     { status: 401 }
//     //   );
//     // }

//     const client = new MongoClient(process.env.MONGODB_URI || '');
//     await client.connect();
//     const dbName = 'test';
//     const db = client.db(dbName);
//     const collection = db.collection('memory');

//     const memory = new BufferMemory({
//       chatHistory: new MongoDBChatMessageHistory({
//         collection,
//         sessionId: conversationId,
//       }),
//       inputKey: 'question',
//       outputKey: 'text',
//       memoryKey: 'chat_history',
//     });

//     // Instantiate the vector store
//     const vectorStore = await PineconeStore.fromExistingIndex(
//       new OpenAIEmbeddings(),
//       {
//         pineconeIndex,
//         filter: {
//           conversationId: conversationId,
//         },
//       }
//     );

//     const retriever = vectorStore.asRetriever();

//     const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
//       returnSourceDocuments: true,
//       inputKey: 'question',
//       outputKey: 'text',
//       memory,
//     });

//     const pastMessages = await memory.chatHistory.getMessages();
//     const chatHistory = new ChatMessageHistory(pastMessages);

//     const res1 = await chain.invoke({
//       question: 'What is it using github or bitbucket for repo?.',
//       chat_history: chatHistory,
//     });
//     console.log({ res1 });
//     const pastMessages2 = await memory.chatHistory.getMessages();
//     const chatHistory2 = new ChatMessageHistory(pastMessages2);

//     const res2 = await chain.invoke({
//       question: 'link for it?',
//       chat_history: chatHistory2,
//     });
//     console.log({ res2 });

//     // Return the results
//     return Response.json(
//       {
//         success: true,
//         message: 'Search completed successfully',
//         // results,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error in vector search:', error);
//     return Response.json(
//       { success: false, message: 'Error during search' },
//       { status: 500 }
//     );
//   }
// }
