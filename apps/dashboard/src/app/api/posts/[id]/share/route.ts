// src/app/api/posts/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../../packages/lib/mongodb';
import Post from '../../../../../lib/models/Posts';

// POST /api/posts/[id]/share - Track share action
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: postId } = await context.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment share count
    post.sharesCount += 1;
    await post.save();

    // Generate shareable link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/activityfeed/post/${postId}`;

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        sharesCount: post.sharesCount,
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