import dbConnect from '@/lib/dbConnect';
import ConversationModel from '@/model/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

/**
 * Handle GET requests to /api/conversations with pagination
 * @param {Request} request - The incoming GET request
 * @returns {Response} - The response containing the list of conversations
 */
export async function GET(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;

    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!session || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Not authenticated' }),
        { status: 401 }
      );
    }

    const total = await ConversationModel.countDocuments({ userId: user._id });
    const conversations = await ConversationModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const hasMore = page * limit < total;

    return new Response(
      JSON.stringify({
        success: true,
        conversations,
        nextCursor: hasMore ? page + 1 : null,
        message: 'Successfully fetched conversations',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error fetching conversations',
      }),
      { status: 500 }
    );
  }
}
