import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import { authOptions } from '../../auth/[...nextauth]/options';
import { getServerSession } from 'next-auth/next';
import { MongoClient, ObjectId } from 'mongodb';
import MessageModel from '@/model/Message';
import ConversationModel from '@/model/Conversation';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    await dbConnect();

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

    const { message } = await request.json();

    // Save the user's message
    const userMessageDoc = new MessageModel({
      userId: user._id,
      conversationId: new ObjectId(conversationId),
      message: message,
      messageType: 'human',
    });
    await userMessageDoc.save();

    // Return the saved human message
    return Response.json(
      {
        success: true,
        message: userMessageDoc,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in saving human message:', error);
    return Response.json(
      { success: false, message: 'Error during message saving' },
      { status: 500 }
    );
  }
}
