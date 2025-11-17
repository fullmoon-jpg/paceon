import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Like from '@/lib/models/Like';

interface LikeDocument {
  _id: string;
  userId: string;
  targetType: string;
  targetId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const like = await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId,
    }) as LikeDocument | null;

    return NextResponse.json({
      success: true,
      data: { isLiked: !!like },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
