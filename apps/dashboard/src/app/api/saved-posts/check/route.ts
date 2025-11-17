import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import SavedPost from '@/lib/models/SavedPost';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    const savedPost = await SavedPost.findOne({ userId, postId });

    return NextResponse.json({
      success: true,
      data: { isSaved: !!savedPost },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
