// src/app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Comment from '@/lib/models/Comment';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';
import { Types } from 'mongoose';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Define proper types for MongoDB documents
interface CommentDocument {
  _id: Types.ObjectId;
  userId: string;
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const postId = id;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .lean<CommentDocument[]>(); // Type hint for lean()

    if (!comments.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = [...new Set(comments.map((c) => c.userId))];

    const { data: userProfiles, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (userError) {
      console.error('Error fetching user profiles:', userError);
    }

    const userMap = new Map<string, UserProfile>(
      (userProfiles || []).map((user: UserProfile) => [user.id, user])
    );

    const commentsWithUsers = comments.map((comment) => ({
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
  } catch (error: unknown) {
    console.error('GET /api/posts/[id]/comments error:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const postId = id;

    const { userId, content } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = await Comment.create({
      userId,
      postId,
      content: content.trim(),
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const { data: userProfile } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single<UserProfile>();

    // Convert comment to plain object with proper typing
    const commentObj = comment.toObject() as CommentDocument;

    const commentWithUser = {
      ...commentObj,
      _id: commentObj._id.toString(),
      user: userProfile || {
        id: userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

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
            comment_id: commentObj._id.toString(),
            comment_content: content.substring(0, 100),
          },
        });
      } catch (notifError: unknown) {
        console.error('Failed to create notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      data: commentWithUser,
    });
  } catch (error: unknown) {
    console.error('POST /api/posts/[id]/comments error:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}