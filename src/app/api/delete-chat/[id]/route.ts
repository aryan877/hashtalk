import { Pinecone, Index } from '@pinecone-database/pinecone';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import ConversationModel from '@/model/Conversation';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
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

    // Prepare SQS message
    const sqsMessage = {
      QueueUrl: process.env.SQS_DELETE_EMBEDDINGS_QUEUE_URL as string, // Delete SQS queue URL
      MessageBody: JSON.stringify({ conversationId: chatId }),
    };

    // Send the message to SQS
    await sqs.sendMessage(sqsMessage).promise();

    return new Response(
      JSON.stringify({ success: true, message: 'Chat deletion initiated' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initiating chat deletion:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error processing request' }),
      { status: 500 }
    );
  }
}
