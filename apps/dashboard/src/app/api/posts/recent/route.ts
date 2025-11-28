// src/app/api/posts/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';

// Types
interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface CachedProfile {
  profile: UserProfile;
  timestamp: number;
}

interface PostDocument {
  _id: { toString(): string };
  userId: string;
  content: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

interface EnrichedPost extends Omit<PostDocument, '_id'> {
  _id: string;
  user: UserProfile;
}

interface ErrorResponse {
  success: false;
  error: string;
}

interface SuccessResponse {
  success: true;
  data: EnrichedPost[];
  count: number;
}

type APIResponse = SuccessResponse | ErrorResponse;

// Cache helper
const profileCache = new Map<string, CachedProfile>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const now = Date.now();
  const uncachedIds: string[] = [];
  const result = new Map<string, UserProfile>();

  // Check cache first
  for (const userId of userIds) {
    const cached = profileCache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      result.set(userId, cached.profile);
    } else {
      uncachedIds.push(userId);
    }
  }

  // Fetch uncached profiles
  if (uncachedIds.length > 0) {
    try {
      const { data: profiles, error } = await supabaseAdmin
        .from('users_profile')
        .select('id, full_name, avatar_url')
        .in('id', uncachedIds);

      if (error) {
        console.error('Supabase fetch error:', error);
      }

      // Cache and add to result
      profiles?.forEach(profile => {
        const userProfile: UserProfile = {
          id: profile.id,
          full_name: profile.full_name || 'Unknown User',
          avatar_url: profile.avatar_url || null,
        };
        
        profileCache.set(profile.id, { 
          profile: userProfile, 
          timestamp: now 
        });
        result.set(profile.id, userProfile);
      });

      // Add fallback for missing profiles
      uncachedIds.forEach(id => {
        if (!result.has(id)) {
          const fallbackProfile: UserProfile = {
            id,
            full_name: 'Unknown User',
            avatar_url: null,
          };
          result.set(id, fallbackProfile);
        }
      });
    } catch (fetchError) {
      console.error('Error fetching user profiles:', fetchError);
      
      // Fallback for all uncached IDs on error
      uncachedIds.forEach(id => {
        const fallbackProfile: UserProfile = {
          id,
          full_name: 'Unknown User',
          avatar_url: null,
        };
        result.set(id, fallbackProfile);
      });
    }
  }

  return result;
}

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    if (!since) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'since parameter is required' 
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // Validate date
    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid date format for since parameter' 
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // Fetch posts
    const posts = await Post.find({
      createdAt: { $gt: sinceDate }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<PostDocument[]>();

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      } satisfies SuccessResponse);
    }

    // Extract unique user IDs
    const userIds = [...new Set(posts.map(post => post.userId))];
    
    // Fetch user profiles with caching
    const userMap = await fetchUserProfiles(userIds);

    // Enrich posts with user data
    const enrichedPosts: EnrichedPost[] = posts.map(post => {
      const user = userMap.get(post.userId) || {
        id: post.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      };

      return {
        ...post,
        _id: post._id.toString(),
        user,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedPosts,
      count: enrichedPosts.length
    } satisfies SuccessResponse);

  } catch (error) {
    console.error('GET /api/posts/recent error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}