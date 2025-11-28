import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';

interface PostDocument {
  _id: { toString: () => string };
  userId: string;
  content: string;
  mediaUrls?: string[];
  location?: string;
  sport?: string;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<void>;
  toObject: () => Record<string, unknown>;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface PatchRequestBody {
  userId: string;
  content?: string;
  mediaUrls?: string[];
  location?: string;
  sport?: string;
}

interface DeleteRequestBody {
  userId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;

    const post = await Post.findById(postId).lean() as Record<string, unknown> | null;

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', post.userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
    }

    const postWithUser = {
      ...post,
      _id: (post._id as { toString: () => string }).toString(),
      user: userProfile || {
        id: post.userId as string,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    return NextResponse.json({
      success: true,
      data: postWithUser,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
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
    const postId = resolvedParams.id;
    const body = await request.json() as PatchRequestBody;
    const { userId, content, mediaUrls, location, sport } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId) as PostDocument | null;

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (content !== undefined) post.content = content;
    if (mediaUrls !== undefined) post.mediaUrls = mediaUrls;
    if (location !== undefined) post.location = location;
    if (sport !== undefined) post.sport = sport;

    await post.save();

    const { data: userProfile } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', post.userId)
      .single();

    const postWithUser = {
      ...post.toObject(),
      _id: post._id.toString(),
      user: userProfile || {
        id: post.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    return NextResponse.json({
      success: true,
      data: postWithUser,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const body = await request.json() as DeleteRequestBody;
    const { userId } = body;

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId) as PostDocument | null;

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const isOwner = post.userId === userId;
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
