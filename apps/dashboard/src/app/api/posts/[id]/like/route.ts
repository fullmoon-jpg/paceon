// src/app/api/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import Like from '@/lib/models/Like';
import { supabaseAdmin } from '@paceon/lib/supabase';

// ✅ Enhanced rate limiter with request tracking
const rateLimitMap = new Map<string, { 
  lastRequest: number; 
  processing: boolean;
  requestCount: number;
  resetTime: number;
}>();

const RATE_LIMIT_MS = 1000; // 1 second between requests
const MAX_REQUESTS_PER_MINUTE = 10; // Max 10 requests per minute per user-post pair
const MINUTE_MS = 60 * 1000;

function checkRateLimit(userId: string, postId: string): { allowed: boolean; reason?: string } {
  const rateLimitKey = `${userId}:${postId}`;
  const entry = rateLimitMap.get(rateLimitKey);
  const now = Date.now();

  // Check if currently processing
  if (entry?.processing) {
    return { allowed: false, reason: 'Request already in progress' };
  }

  if (!entry) {
    // First request
    rateLimitMap.set(rateLimitKey, {
      lastRequest: now,
      processing: true,
      requestCount: 1,
      resetTime: now + MINUTE_MS,
    });
    return { allowed: true };
  }

  // Reset counter if minute has passed
  if (now > entry.resetTime) {
    rateLimitMap.set(rateLimitKey, {
      lastRequest: now,
      processing: true,
      requestCount: 1,
      resetTime: now + MINUTE_MS,
    });
    return { allowed: true };
  }

  // Check per-minute limit
  if (entry.requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, reason: 'Too many requests per minute' };
  }

  // Check cooldown
  if (now - entry.lastRequest < RATE_LIMIT_MS) {
    return { allowed: false, reason: 'Please wait before liking again' };
  }

  // Update entry
  rateLimitMap.set(rateLimitKey, {
    lastRequest: now,
    processing: true,
    requestCount: entry.requestCount + 1,
    resetTime: entry.resetTime,
  });

  return { allowed: true };
}

function releaseRateLimit(userId: string, postId: string) {
  const rateLimitKey = `${userId}:${postId}`;
  const entry = rateLimitMap.get(rateLimitKey);
  
  if (entry) {
    rateLimitMap.set(rateLimitKey, {
      ...entry,
      processing: false,
    });
  }
}

function cleanupRateLimit(userId: string, postId: string) {
  const rateLimitKey = `${userId}:${postId}`;
  rateLimitMap.delete(rateLimitKey);
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime + MINUTE_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string | undefined;
  let postId: string | undefined;

  try {
    await connectDB();

    const resolvedParams = await params;
    postId = resolvedParams.id;
    
    const body = await request.json();
    userId = body.userId;
    const clientAction = body.action; // 'like' or 'unlike'

    console.log('🔵 API REQUEST:', { postId, userId, clientAction });

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    // ✅ Check rate limit
    const rateLimitCheck = checkRateLimit(userId, postId);
    if (!rateLimitCheck.allowed) {
      console.warn(`⚠️ Rate limit hit: ${rateLimitCheck.reason}`);
      return NextResponse.json(
        { success: false, error: rateLimitCheck.reason },
        { status: 429 }
      );
    }

    // ✅ Find post
    const post = await Post.findById(postId);

    if (!post) {
      cleanupRateLimit(userId, postId);
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // ✅ Check current like status dari Like collection
    const existingLike = await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId,
    });

    const isCurrentlyLiked = !!existingLike;
    const postOwnerId = post.userId.toString();

    console.log('📊 SERVER Current state:', {
      postId,
      userId,
      isCurrentlyLiked,
      currentLikesCount: post.likesCount,
      clientAction,
    });

    let actionPerformed: 'liked' | 'unliked' | 'no-change';
    let newLikesCount = post.likesCount;

    // ✅ IDEMPOTENT OPERATION
    if (clientAction === 'unlike') {
      if (isCurrentlyLiked) {
        // Actually unlike - delete Like document
        await Like.deleteOne({
          userId,
          targetType: 'post',
          targetId: postId,
        });

        // Decrement counter
        newLikesCount = Math.max(0, post.likesCount - 1);
        post.likesCount = newLikesCount;
        await post.save();

        actionPerformed = 'unliked';
        console.log('➖ SERVER UNLIKE executed:', { newLikesCount });
      } else {
        // Already unliked - return current state (idempotent)
        actionPerformed = 'no-change';
        console.log('⚠️ Already unliked - returning current state');
      }
    } else if (clientAction === 'like') {
      if (!isCurrentlyLiked) {
        // Actually like - create Like document
        try {
          await Like.create({
            userId,
            targetType: 'post',
            targetId: postId,
          });

          // Increment counter
          newLikesCount = post.likesCount + 1;
          post.likesCount = newLikesCount;
          await post.save();

          actionPerformed = 'liked';
          console.log('➕ SERVER LIKE executed:', { newLikesCount });

          // ✅ Create notification (only if not self-like)
          if (userId !== postOwnerId) {
            try {
              const { data: actorProfile } = await supabaseAdmin
                .from('users_profile')
                .select('id, full_name, avatar_url')
                .eq('id', userId)
                .single();

              await supabaseAdmin.from('notifications').insert({
                user_id: postOwnerId,
                actor_id: userId,
                type: 'social',
                category: 'like',
                title: 'New Like',
                message: `${actorProfile?.full_name || 'Someone'} liked your post`,
                is_read: false,
                metadata: {
                  post_id: postId,
                  post_content: post.content.substring(0, 100)
                }
              });

              console.log('✅ Like notification created');
            } catch (notifError) {
              console.error('⚠️ Failed to create notification:', notifError);
              // Don't fail the request if notification fails
            }
          }
        } catch (error: any) {
          // Handle duplicate key error (race condition safety)
          if (error.code === 11000) {
            console.warn('⚠️ Duplicate like attempt (race condition caught by DB)');
            actionPerformed = 'no-change';
            
            // Still sync the count to be safe
            const actualCount = await Like.countDocuments({
              targetType: 'post',
              targetId: postId,
            });
            
            if (actualCount !== post.likesCount) {
              post.likesCount = actualCount;
              await post.save();
              newLikesCount = actualCount;
            }
          } else {
            throw error; // Re-throw other errors
          }
        }
      } else {
        // Already liked - return current state (idempotent)
        actionPerformed = 'no-change';
        console.log('⚠️ Already liked - returning current state');
      }
    } else {
      cleanupRateLimit(userId, postId);
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "like" or "unlike"' },
        { status: 400 }
      );
    }

    // ✅ Release rate limit
    releaseRateLimit(userId, postId);

    // ✅ Get final state untuk ensure consistency
    const finalLike = await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId,
    });
    const finalIsLiked = !!finalLike;

    // ✅ Get actual count dari database untuk ensure accuracy
    const actualCount = await Like.countDocuments({
      targetType: 'post',
      targetId: postId,
    });

    // ✅ Sync count jika ada discrepancy
    if (actualCount !== post.likesCount) {
      console.warn(`⚠️ Count mismatch! Post: ${post.likesCount}, Actual: ${actualCount}. Syncing...`);
      post.likesCount = actualCount;
      await post.save();
      newLikesCount = actualCount;
    }

    console.log('✅ SERVER RESPONSE:', {
      isLiked: finalIsLiked,
      likesCount: newLikesCount,
      actionPerformed,
    });

    return NextResponse.json({
      success: true,
      data: {
        isLiked: finalIsLiked,
        likesCount: newLikesCount,
      },
      message: actionPerformed === 'liked' 
        ? 'Post liked' 
        : actionPerformed === 'unliked' 
        ? 'Post unliked' 
        : 'State synchronized',
    });

  } catch (error: any) {
    console.error('❌ POST /api/posts/[id]/like error:', error);
    
    // Clean up rate limit on error
    if (userId && postId) {
      cleanupRateLimit(userId, postId);
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
