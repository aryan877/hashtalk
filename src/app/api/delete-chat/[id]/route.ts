import dbConnect from '@/lib/dbConnect';
import ConversationModel from '@/model/Conversation';
import MessageModel from '@/model/Message';
import { Index, Pinecone } from '@pinecone-database/pinecone';
import AWS from 'aws-sdk';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create SQS client
const sqs = new AWS.SQS();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const chatId = params.id;
  await dbConnect();

  // Authenticate the user
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Check if the chat exists and belongs to the user
    const chat = await ConversationModel.findOne({
      _id: chatId,
      userId: user._id,
    });
    if (!chat) {
      return Response.json(
        { success: false, message: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Delete all messages associated with the chatId
    await MessageModel.deleteMany({ conversationId: chatId });

    // Delete chat from MongoDB
    const deletedChat = await ConversationModel.findByIdAndDelete(chatId);
    if (!deletedChat) {
      return Response.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );
    }

    // Prepare SQS message
    const sqsMessage = {
      QueueUrl: process.env.SQS_DELETE_EMBEDDINGS_QUEUE_URL as string, // Delete SQS queue URL
      MessageBody: JSON.stringify({ conversationId: chatId }),
    };

    // Send the message to SQS
    await sqs.sendMessage(sqsMessage).promise();

    return Response.json(
      { success: true, message: 'Chat deletion initiated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initiating chat deletion:', error);
    return Response.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
}
