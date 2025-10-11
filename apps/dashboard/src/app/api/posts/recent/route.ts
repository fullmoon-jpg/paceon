// src/app/api/posts/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../packages/lib/mongodb';
import Post from '../../../../lib/models/Posts';
import { supabaseAdmin } from '../../../../../../../packages/lib/supabase';

// GET /api/posts/recent - Get posts created after a certain time
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    if (!since) {
      return NextResponse.json(
        { success: false, error: 'since parameter is required' },
        { status: 400 }
      );
    }

    const sinceDate = new Date(since);

    // Get posts created after the given time
    const posts = await Post.find({
      createdAt: { $gt: sinceDate }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }

    // Get user data
    const userIds = [...new Set(posts.map(post => post.userId))];
    const { data: profiles } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const userMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Enrich posts
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
      count: enrichedPosts.length
    });
  } catch (error: any) {
    console.error('GET /api/posts/recent error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}