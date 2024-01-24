import dbConnect from '@/lib/dbConnect';
import ConversationModel from '@/model/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

/**
 * Handle GET requests to /api/conversations
 * @param {Request} request - The incoming GET request
 * @returns {Response} - The response containing the list of conversations
 */
export async function GET(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch conversations associated with the user's ID
    const conversations = await ConversationModel.find({ userId: user._id });

    // Return a successful response with the list of conversations
    return Response.json(
      { success: true, conversations: conversations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Return an error response if fetching conversations fails
    return Response.json(
      { success: false, message: 'Error fetching conversations' },
      { status: 500 }
    );
  }
}
