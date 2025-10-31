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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true'; // ✅ Get isAdmin from query

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    // ✅ Check ownership OR admin
    const isOwner = comment.userId === userId;
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const postId = comment.postId;

    await Comment.findByIdAndDelete(commentId);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const commentId = resolvedParams.id;
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });

  } catch (error: any) {
    console.error('PATCH /api/comments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
