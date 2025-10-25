// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabase';
import { broadcastFeedUpdate } from '@/lib/utils/broadcast';

// ===========================
// GET - Fetch Posts
// ===========================
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    // Fetch posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        hasMore: false,
        page,
        limit,
        total: 0
      });
    }

    // Get unique user IDs and convert to string
    const userIds = [...new Set(posts.map(p => p.userId.toString()))];

    // Fetch user profiles from Supabase
    const { data: profiles } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    // Create profile map
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Enrich posts with user data
    const enrichedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      user: profileMap.get(post.userId.toString()) || {
        id: post.userId.toString(),
        full_name: 'Unknown User',
        avatar_url: null,
      },
    }));

    // Calculate total and hasMore
    const totalCount = await Post.countDocuments(query);
    const hasMore = skip + posts.length < totalCount;

    return NextResponse.json({
      success: true,
      data: enrichedPosts,
      hasMore,
      page,
      limit,
      total: totalCount
    });

  } catch (error: any) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ===========================
// POST - Create Post
// ===========================
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, content, mediaUrls, mediaType, location, sport } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      );
    }

    // Create post
    const post = await Post.create({
      userId,
      content,
      mediaUrls: mediaUrls || [],
      mediaType,
      location,
      sport: sport ? sport.toLowerCase() : undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    });

    // Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    const enrichedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      user: profile || {
        id: userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    // ✅ Broadcast to all connected clients (optional - comment out if causing issues)
    try {
      await broadcastFeedUpdate('new_post', enrichedPost);
    } catch (broadcastError) {
      console.warn('Broadcast failed, but post created:', broadcastError);
    }

    // Update user stats (non-blocking)
    supabaseAdmin.rpc('increment_total_posts', { p_user_id: userId })
      .catch(err => console.error('Stats update failed:', err));

    return NextResponse.json({
      success: true,
      data: enrichedPost,
      message: 'Post created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
