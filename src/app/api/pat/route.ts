import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function POST(request: Request) {
  await dbConnect();

  // Authenticate the user
  const session = await getServerSession(authOptions);
  const userId = session?.user;
  if (!session || !userId) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json(
        { success: false, message: 'PAT token is required' },
        { status: 400 }
      );
    }

    // Find the user by ID and update the PAT token
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { patToken: token } },
      { new: true }
    );

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return a successful response
    return Response.json(
      {
        success: true,
        message: 'PAT token updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating PAT token:', error);
    return Response.json(
      { success: false, message: 'Error updating PAT token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  // Authenticate the user
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!session || !userId) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Find the user by ID and remove the PAT token
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $unset: { patToken: '' } }, // Unset the patToken field
      { new: true }
    );

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return a successful response indicating the PAT token was removed
    return Response.json(
      {
        success: true,
        message: 'PAT token removed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing PAT token:', error);
    return Response.json(
      { success: false, message: 'Error removing PAT token' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  // Authenticate the user
  const session = await getServerSession(authOptions);
  const userId = session?.user;
  if (!session || !userId) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Find the user by ID and retrieve the PAT token
    const user = await UserModel.findById(userId);
    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the user has a PAT token set
    if (!user.patToken) {
      return Response.json(
        { success: false, message: 'PAT token not set' },
        { status: 404 }
      );
    }

    // Return the PAT token
    return Response.json(
      {
        success: true,
        message: 'PAT token retrieved successfully',
        patToken: user.patToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving PAT token:', error);
    return Response.json(
      { success: false, message: 'Error retrieving PAT token' },
      { status: 500 }
    );
  }
}
