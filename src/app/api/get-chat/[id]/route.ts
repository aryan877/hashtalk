import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import ConversationModel from '@/model/Conversation';

export async function GET(
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
    // Fetch the chat from MongoDB using the provided ID
    const chat = await ConversationModel.findById(chatId);
    if (!chat) {
      return new Response(
        JSON.stringify({ success: false, message: 'Chat not found' }),
        { status: 404 }
      );
    }

    // Return the fetched chat
    return new Response(JSON.stringify({ success: true, chat }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error fetching chat' }),
      { status: 500 }
    );
  }
}
