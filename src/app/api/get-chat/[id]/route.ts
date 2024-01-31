import dbConnect from '@/lib/dbConnect';
import ConversationModel from '@/model/Conversation';
import { ObjectId } from 'mongodb';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conversationId = params.id;
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
    // Check if the conversation belongs to the user
    const conversation = await ConversationModel.findOne({
      _id: new ObjectId(conversationId),
      userId: user._id, // Assuming the user ID is stored in user._id
    });

    if (!conversation) {
      return Response.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Return the fetched chat
    return Response.json(
      { success: true, conversation },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return Response.json(
      { success: false, message: 'Error fetching conversation' },
      { status: 500 }
    );
  }
}
