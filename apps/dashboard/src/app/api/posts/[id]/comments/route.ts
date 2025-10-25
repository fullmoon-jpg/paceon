// src/app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Comment from '@/lib/models/Comment';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;

    // ✅ Get all comments for this post
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .lean();

    if (comments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // ✅ Get unique user IDs
    const userIds = [...new Set(comments.map(c => c.userId))];

    // ✅ Fetch all user profiles from Supabase
    const { data: userProfiles, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (userError) {
      console.error('Error fetching user profiles:', userError);
    }

    // ✅ Create user lookup map
    const userMap = new Map(
      (userProfiles || []).map(user => [user.id, user])
    );

    // ✅ Combine comments with user data
    const commentsWithUsers = comments.map(comment => ({
      ...comment,
      _id: comment._id.toString(),
      user: userMap.get(comment.userId) || {
        id: comment.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    }));

    return NextResponse.json({
      success: true,
      data: commentsWithUsers,
    });

  } catch (error: any) {
    console.error('GET /api/posts/[id]/comments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // ✅ Create comment
    const comment = await Comment.create({
      userId,
      postId,
      content: content.trim(),
    });

    // ✅ Increment comment count
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    // ✅ Fetch user profile
    const { data: userProfile } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    const commentWithUser = {
      ...comment.toObject(),
      _id: comment._id.toString(),
      user: userProfile || {
        id: userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    // ✅ Create notification (if not self-comment)
    const postOwnerId = post.userId.toString();
    if (userId !== postOwnerId) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: postOwnerId,
          actor_id: userId,
          type: 'social',
          category: 'comment',
          title: 'New Comment',
          message: `${userProfile?.full_name || 'Someone'} commented on your post`,
          is_read: false,
          metadata: {
            post_id: postId,
            comment_id: comment._id.toString(),
            comment_content: content.substring(0, 100),
          }
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      data: commentWithUser,
    });

  } catch (error: any) {
    console.error('POST /api/posts/[id]/comments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
