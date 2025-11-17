import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';

interface PostDocument {
  _id: string;
  sharesCount: number;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: postId } = await context.params;

    const post = await Post.findById(postId) as PostDocument | null;
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    await Post.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://app.paceon.id';
    const shareUrl = `${baseUrl}/activityfeed/post/${postId}`;

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        sharesCount: post.sharesCount + 1,
      },
      message: 'Share link generated',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
