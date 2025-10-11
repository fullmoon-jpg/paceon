// src/app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../packages/lib/mongodb';
import Comment from '../../../../lib/models/Comment';
import Post from '../../../../lib/models/Posts';
import Like from '../../../../lib/models/Like';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // ✅ params harus di-await
    const { id } = await context.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    const postId = comment.postId;

    // ✅ Hapus semua replies + likes-nya
    const replies = await Comment.find({ parentCommentId: id }).select('_id');
    const replyIds = replies.map((r) => r._id);

    // Hapus child comments & likes mereka
    if (replyIds.length > 0) {
      await Like.deleteMany({
        targetType: 'comment',
        targetId: { $in: replyIds },
      });
      await Comment.deleteMany({ _id: { $in: replyIds } });
    }

    // Hapus likes dari comment utama
    await Like.deleteMany({
      targetType: 'comment',
      targetId: id,
    });

    // Hapus comment utama
    await Comment.findByIdAndDelete(id);

    // Update post comment count
    const totalDeleted = 1 + replyIds.length;
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -totalDeleted },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        deletedCount: totalDeleted,
      },
    });
  } catch (error: any) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedComment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: updatedComment.content,
        updatedAt: updatedComment.updatedAt,
      },
      message: 'Comment updated successfully',
    });
  } catch (error: any) {
    console.error('PATCH /api/comments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}