// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
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

    // ✅ Find post from MongoDB
    const post = await Post.findById(postId).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // ✅ Fetch user profile from Supabase
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', post.userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
    }

    // ✅ Combine post with user data
    const postWithUser = {
      ...post,
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

  } catch (error: any) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ PATCH for edit post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const body = await request.json();
    const { userId, content, mediaUrls, location, sport } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (post.userId !== userId) {
      // Check if admin (you can add admin check here)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update fields
    if (content !== undefined) post.content = content;
    if (mediaUrls !== undefined) post.mediaUrls = mediaUrls;
    if (location !== undefined) post.location = location;
    if (sport !== undefined) post.sport = sport;

    await post.save();

    // Fetch user profile for response
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

  } catch (error: any) {
    console.error('PATCH /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ DELETE for delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check ownership (or admin)
    if (post.userId !== userId) {
      // You can add admin check here
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

  } catch (error: any) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
