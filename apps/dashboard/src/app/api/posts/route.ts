import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../packages/lib/mongodb';
import Post from '../../../lib/models/Posts';
import { supabaseAdmin } from '../../../../../../packages/lib/supabase';

// 🧠 GET /api/posts - Get all posts with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId'); // Optional filter
    const sport = searchParams.get('sport'); // Optional filter

    const skip = (page - 1) * limit;

    // 🧩 Build MongoDB query
    const query: any = {};
    if (userId) query.userId = userId;
    if (sport) query.sport = sport.toLowerCase();

    // 🧠 Get posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    // 🧠 Collect unique user IDs from posts
    const userIds = [...new Set(posts.map(post => post.userId))];

    // 🧩 Fetch user profiles from Supabase
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.error('❌ Supabase profile fetch error:', profileError);
    }

    // 🔍 Map Supabase user data by id
    const userMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // ✨ Enrich posts with user info
    const enrichedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      user: userMap.get(post.userId) || {
        id: post.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    }));

    // ✅ Success
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
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// 🧠 POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, content, mediaUrls, mediaType, location, sport } = body;

    // ✅ Basic validation
    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 },
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content too long (max 5000 characters)' },
        { status: 400 },
      );
    }

    // 🧩 Create the post
    const post = await Post.create({
      userId,
      content,
      mediaUrls: mediaUrls || [],
      mediaType,
      location,
      sport: sport ? sport.toLowerCase() : undefined,
    });

    // 🧠 Increment user's post count in Supabase
    const { error: statsError } = await supabaseAdmin.rpc(
      'increment_total_posts',
      { p_user_id: userId },
    );
    if (statsError) console.error('⚠️ Failed to increment total_posts:', statsError);

    // 🧠 Fetch author info from Supabase
    console.log('🔍 Fetching profile for userId:', userId);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('⚠️ Supabase profile fetch error:', profileError);
      console.error('⚠️ userId that failed:', userId);
    } else {
      console.log('✅ Profile found:', profile);
    }

    // ✨ Attach user info
    const enrichedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      user: profile || {
        id: userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: enrichedPost,
        message: 'Post created successfully',
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}