// src/app/api/posts/recent/route.ts - Same pattern
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabase';

// Reuse cache helper (extract to shared utils if needed)
const profileCache = new Map<string, { profile: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchUserProfiles(userIds: string[]) {
  const now = Date.now();
  const uncachedIds: string[] = [];
  const result = new Map();

  for (const userId of userIds) {
    const cached = profileCache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      result.set(userId, cached.profile);
    } else {
      uncachedIds.push(userId);
    }
  }

  if (uncachedIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', uncachedIds);

    profiles?.forEach(profile => {
      profileCache.set(profile.id, { profile, timestamp: now });
      result.set(profile.id, profile);
    });

    uncachedIds.forEach(id => {
      if (!result.has(id)) {
        result.set(id, { id, full_name: 'Unknown User', avatar_url: null });
      }
    });
  }

  return result;
}

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

    const userIds = [...new Set(posts.map(post => post.userId))];
    
    // Use cached fetch
    const userMap = await fetchUserProfiles(userIds);

    const enrichedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      user: userMap.get(post.userId),
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
