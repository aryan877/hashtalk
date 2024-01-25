import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import ConversationModel from '@/model/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();

/**
 * Handle POST requests to /api/pinecone
 * @param {Request} request - The incoming POST request
 * @returns {Response} - The response indicating success or failure
 */
export async function POST(request: Request) {
  let newConversation = null;

  try {
    await dbConnect();
    const { markdown, blogUrl, blogTitle, blogSubtitle, blogPublishDate } =
      await request.json();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    newConversation = await ConversationModel.create({
      userId: user._id,
      blogUrl,
      blogTitle,
      blogSubtitle,
      blogPublishDate,
      markdown,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Prepare the message for SQS
    const sqsMessage = {
      QueueUrl: process.env.SQS_CREATE_EMBEDDINGS_QUEUE_URL as string,
      MessageBody: JSON.stringify({
        conversationId: newConversation._id.toString(),
        markdown,
      }),
    };

    // Send the message to SQS
    await sqs.sendMessage(sqsMessage).promise();

    return Response.json(
      {
        success: true,
        message: 'Message processed and sent to SQS',
        conversation: newConversation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing message:', error);

    // Delete the created conversation in MongoDB
    if (newConversation && newConversation._id) {
      await ConversationModel.findByIdAndDelete(newConversation._id);
    }

    return Response.json(
      { success: false, message: 'Error processing message' },
      { status: 500 }
    );
  }
}
