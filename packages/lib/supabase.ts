// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ✅ Always works - direct access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ Client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Function to create admin client (lazy initialization)
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    // ✅ Read at runtime, not module-level
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _supabaseAdmin;
};

// ✅ For backward compatibility - export as function call
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>];
  }
});
