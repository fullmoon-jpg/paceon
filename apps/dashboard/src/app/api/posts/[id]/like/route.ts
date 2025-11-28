import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import Post from '@/lib/models/Posts';
import Like from '@/lib/models/Like';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';

interface RateLimitEntry {
  lastRequest: number;
  processing: boolean;
  requestCount: number;
  resetTime: number;
}

interface PostDocument {
  _id: string;
  userId: string;
  content: string;
  likesCount: number;
  save: () => Promise<void>;
}

interface LikeDocument {
  _id: string;
  userId: string;
  targetType: string;
  targetId: string;
}

interface RequestBody {
  userId: string;
  action: 'like' | 'unlike';
}

interface MongoError extends Error {
  code?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MS = 1000;
const MAX_REQUESTS_PER_MINUTE = 10;
const MINUTE_MS = 60 * 1000;

// =====================================================
// ⭐️ AUTO RECOVER: reset processing kalau stale
// =====================================================
function checkRateLimit(userId: string, postId: string): { allowed: boolean; reason?: string } {
  const key = `${userId}:${postId}`;
  const entry = rateLimitMap.get(key);
  const now = Date.now();

  if (entry) {
    // ⭐️ (Fix utama) Pindah tab → request lama aborted → processing tetap true
    // Auto-reset jika stuck > 1500ms
    if (entry.processing && now - entry.lastRequest > 1500) {
      entry.processing = false;
    }
  }

  if (entry?.processing) {
    return { allowed: false, reason: 'Request already in progress' };
  }

  if (!entry) {
    rateLimitMap.set(key, {
      lastRequest: now,
      processing: true,
      requestCount: 1,
      resetTime: now + MINUTE_MS,
    });
    return { allowed: true };
  }

  if (now > entry.resetTime) {
    rateLimitMap.set(key, {
      lastRequest: now,
      processing: true,
      requestCount: 1,
      resetTime: now + MINUTE_MS,
    });
    return { allowed: true };
  }

  if (entry.requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, reason: 'Too many requests per minute' };
  }

  if (now - entry.lastRequest < RATE_LIMIT_MS) {
    return { allowed: false, reason: 'Please wait before liking again' };
  }

  entry.lastRequest = now;
  entry.processing = true;
  entry.requestCount++;
  return { allowed: true };
}

function releaseRateLimit(userId: string, postId: string) {
  const key = `${userId}:${postId}`;
  const entry = rateLimitMap.get(key);
  if (entry) entry.processing = false;
}

function cleanupRateLimit(userId: string, postId: string) {
  rateLimitMap.delete(`${userId}:${postId}`);
}

// =====================================================
// ⭐️ Cleanup lebih cepat → hapus stale entries tiap 10 detik
// =====================================================
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.lastRequest > 10000) {
      rateLimitMap.delete(key);
    }
  }
}, 10_000);


// =====================================================
// API HANDLER
// =====================================================
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

    const body = (await request.json()) as RequestBody;
    userId = body.userId;
    const clientAction = body.action;

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    const rateLimitCheck = checkRateLimit(userId, postId);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitCheck.reason },
        { status: 429 }
      );
    }

    const post = (await Post.findById(postId)) as PostDocument | null;

    if (!post) {
      cleanupRateLimit(userId, postId);
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const existingLike = (await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId,
    })) as LikeDocument | null;

    const isCurrentlyLiked = !!existingLike;
    const postOwnerId = post.userId.toString();

    let actionPerformed: 'liked' | 'unliked' | 'no-change';
    let newLikesCount = post.likesCount;

    // =====================================================
    // UNLIKE
    // =====================================================
    if (clientAction === 'unlike') {
      if (isCurrentlyLiked) {
        await Like.deleteOne({
          userId,
          targetType: 'post',
          targetId: postId,
        });

        newLikesCount = Math.max(0, post.likesCount - 1);
        post.likesCount = newLikesCount;
        await post.save();

        actionPerformed = 'unliked';
      } else {
        actionPerformed = 'no-change';
      }
    }

    // =====================================================
    // LIKE
    // =====================================================
    else if (clientAction === 'like') {
      if (!isCurrentlyLiked) {
        try {
          await Like.create({
            userId,
            targetType: 'post',
            targetId: postId,
          });

          newLikesCount = post.likesCount + 1;
          post.likesCount = newLikesCount;
          await post.save();

          actionPerformed = 'liked';

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
                  post_content: post.content.substring(0, 100),
                },
              });
            } catch (_) {}
          }
        } catch (error) {
          const mongoError = error as MongoError;
          if (mongoError.code === 11000) {
            actionPerformed = 'no-change';
            const count = await Like.countDocuments({
              targetType: 'post',
              targetId: postId,
            });
            if (count !== post.likesCount) {
              post.likesCount = count;
              await post.save();
              newLikesCount = count;
            }
          } else {
            throw error;
          }
        }
      } else {
        actionPerformed = 'no-change';
      }
    }

    else {
      cleanupRateLimit(userId, postId);
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "like" or "unlike"' },
        { status: 400 }
      );
    }

    // =====================================================
    // ⭐️ RELEASE ALWAYS (No deadlock)
    // =====================================================
    releaseRateLimit(userId, postId);

    // =====================================================
    // ⭐️ ONLY sync count if action changed
    // =====================================================
    if (actionPerformed !== 'no-change') {
      const count = await Like.countDocuments({
        targetType: 'post',
        targetId: postId,
      });

      if (count !== post.likesCount) {
        post.likesCount = count;
        await post.save();
        newLikesCount = count;
      }
    }

    const finalLike = (await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId,
    })) as LikeDocument | null;
    const finalIsLiked = !!finalLike;

    return NextResponse.json({
      success: true,
      data: {
        isLiked: finalIsLiked,
        likesCount: newLikesCount,
      },
      message:
        actionPerformed === 'liked'
          ? 'Post liked'
          : actionPerformed === 'unliked'
          ? 'Post unliked'
          : 'State synchronized',
    });
  } catch (error) {
    if (userId && postId) cleanupRateLimit(userId, postId);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}