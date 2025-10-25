// src/lib/utils/cache.ts
import { supabaseAdmin } from '@paceon/lib/supabase';

// ✅ Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const profileCache = new Map<string, { profile: any; timestamp: number }>();
const roleCache = new Map<string, { role: string; timestamp: number }>();

// ✅ Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  
  for (const [key, value] of profileCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      profileCache.delete(key);
    }
  }
  
  for (const [key, value] of roleCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      roleCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every 1 minute

/**
 * Fetch user profiles with caching
 * @param userIds - Array of user IDs to fetch
 * @returns Map of userId -> profile
 */
export async function fetchUserProfiles(userIds: string[]): Promise<Map<string, any>> {
  if (userIds.length === 0) return new Map();

  const now = Date.now();
  const uncachedIds: string[] = [];
  const result = new Map();

  // ✅ Check cache first
  for (const userId of userIds) {
    const cached = profileCache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      result.set(userId, cached.profile);
    } else {
      uncachedIds.push(userId);
    }
  }

  // ✅ Fetch uncached profiles in batch
  if (uncachedIds.length > 0) {
    try {
      const { data: profiles, error } = await supabaseAdmin
        .from('users_profile')
        .select('id, full_name, avatar_url')
        .in('id', uncachedIds);

      if (error) {
        console.error('Error fetching profiles:', error);
      }

      // ✅ Cache and add to result
      profiles?.forEach(profile => {
        profileCache.set(profile.id, { profile, timestamp: now });
        result.set(profile.id, profile);
      });

      // ✅ Add fallback for missing profiles
      uncachedIds.forEach(id => {
        if (!result.has(id)) {
          const fallback = { id, full_name: 'Unknown User', avatar_url: null };
          profileCache.set(id, { profile: fallback, timestamp: now });
          result.set(id, fallback);
        }
      });
    } catch (err) {
      console.error('Error in fetchUserProfiles:', err);
      // Return fallbacks for all uncached
      uncachedIds.forEach(id => {
        if (!result.has(id)) {
          result.set(id, { id, full_name: 'Unknown User', avatar_url: null });
        }
      });
    }
  }

  return result;
}

/**
 * Get user role with caching
 * @param userId - User ID to fetch role for
 * @returns User role string
 */
export async function getUserRole(userId: string): Promise<string> {
  const now = Date.now();
  const cached = roleCache.get(userId);
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.role;
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('users_profile')
      .select('role')
      .eq('id', userId)
      .single();

    const role = profile?.role || 'user';
    roleCache.set(userId, { role, timestamp: now });
    
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
}

/**
 * Check if user is authorized (owner or admin)
 * @param userId - Requesting user ID
 * @param resourceUserId - Resource owner user ID
 * @returns Authorization result
 */
export async function checkAuthorization(
  userId: string,
  resourceUserId: string
): Promise<{ authorized: boolean; isAdmin: boolean }> {
  // ✅ Quick check: if user is owner
  if (userId === resourceUserId) {
    return { authorized: true, isAdmin: false };
  }

  // ✅ Check if user is admin (cached)
  const role = await getUserRole(userId);
  const isAdmin = role === 'admin';
  
  return { authorized: isAdmin, isAdmin };
}

/**
 * Invalidate cache for specific user
 * @param userId - User ID to invalidate
 */
export function invalidateUserCache(userId: string) {
  profileCache.delete(userId);
  roleCache.delete(userId);
  console.log(`Cache invalidated for user: ${userId}`);
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  profileCache.clear();
  roleCache.clear();
  console.log('All caches cleared');
}

/**
 * Get cache stats for monitoring
 */
export function getCacheStats() {
  return {
    profiles: {
      size: profileCache.size,
      keys: Array.from(profileCache.keys()),
    },
    roles: {
      size: roleCache.size,
      keys: Array.from(roleCache.keys()),
    },
  };
}
