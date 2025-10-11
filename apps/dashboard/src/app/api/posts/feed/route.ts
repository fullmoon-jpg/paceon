// src/app/api/posts/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../packages/lib/mongodb';
import Post from '../../../../lib/models/Posts';
import { supabaseAdmin } from '../../../../../../../packages/lib/supabase';

// GET /api/posts/feed - Personalized feed (future: based on connections, preferences)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId'); // Current user

    const skip = (page - 1) * limit;

    // Future: Get user's connections from Supabase
    // const { data: connections } = await supabaseAdmin
    //   .from('user_connections')
    //   .select('connected_user_id')
    //   .eq('user_id', userId);
    // const connectionIds = connections?.map(c => c.connected_user_id) || [];

    // For now: Show all posts (global feed)
    const query: any = {};

    // Future: Filter by connections
    // if (connectionIds.length > 0) {
    //   query.userId = { $in: [...connectionIds, userId] };
    // }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    // Get user data
    const userIds = [...new Set(posts.map(post => post.userId))];
    const { data: profiles } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const userMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const enrichedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      user: userMap.get(post.userId) || {
        id: post.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    }));

    return NextResponse.json({
      success: true,
      data: enrichedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error('GET /api/posts/feed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}