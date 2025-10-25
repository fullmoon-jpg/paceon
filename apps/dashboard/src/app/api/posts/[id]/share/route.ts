// src/app/api/posts/[id]/share/route.ts
// ✅ This route is already optimal - no user fetching needed
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: postId } = await context.params;

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // ✅ Use atomic increment
    await Post.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/activityfeed/post/${postId}`;

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        sharesCount: post.sharesCount + 1,
      },
      message: 'Share link generated',
    });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/share error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
