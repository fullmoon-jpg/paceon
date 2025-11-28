import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';
import { broadcastFeedUpdate } from '@/lib/utils/broadcast';

interface PostDocument {
  _id: { toString: () => string };
  userId: { toString: () => string };
  content: string;
  createdAt: Date;
  [key: string]: unknown;
}

interface PostDocumentWithMethods extends PostDocument {
  toObject: () => Record<string, unknown>;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (userId) {
      query.userId = userId;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as PostDocument[];

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

    const userIds = [...new Set(posts.map(p => p.userId.toString()))];

    const { data: profiles } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    const profileMap = new Map<string, UserProfile>(
      (profiles || []).map((p: UserProfile) => [p.id, p])
    );

    const enrichedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      user: profileMap.get(post.userId.toString()) || {
        id: post.userId.toString(),
        full_name: 'Unknown User',
        avatar_url: null,
      },
    }));

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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;
    const location = formData.get('location') as string;
    const sport = formData.get('sport') as string;
    const mediaFiles = formData.getAll('media') as File[];

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId and content are required' },
        { status: 400 }
      );
    }

    const mediaUrls: string[] = [];
    
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `posts/${userId}/${fileName}`;

          const { data, error } = await supabaseAdmin.storage
            .from('media')
            .upload(filePath, fileBuffer, {
              contentType: file.type,
            });

          if (!error && data) {
            const { data: urlData } = supabaseAdmin.storage
              .from('media')
              .getPublicUrl(filePath);
            
            if (urlData) {
              mediaUrls.push(urlData.publicUrl);
            }
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
        }
      }
    }

    const post = await Post.create({
      userId,
      content,
      mediaUrls: mediaUrls || [],
      location,
      sport: sport ? sport.toLowerCase() : undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    }) as unknown as PostDocumentWithMethods;

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

    try {
      await broadcastFeedUpdate('new_post', enrichedPost);
    } catch (broadcastError) {
      console.warn('Broadcast failed:', broadcastError);
    }

    supabaseAdmin.rpc('increment_total_posts', { p_user_id: userId })
      .catch(err => console.error('Stats update failed:', err));

    return NextResponse.json({
      success: true,
      data: enrichedPost,
      message: 'Post created successfully',
    }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
