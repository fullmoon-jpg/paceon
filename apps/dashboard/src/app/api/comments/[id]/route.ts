// src/app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Comment from '@/lib/models/Comment';
import Post from '@/lib/models/Posts';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const commentId = resolvedParams.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (comment.userId !== userId) {
      // You can add admin check here
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const postId = comment.postId;

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    // Decrement comment count
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: -1 } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });

  } catch (error: any) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
