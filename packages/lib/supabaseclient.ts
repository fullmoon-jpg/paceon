// lib/supabaseclient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    storageKey: 'paceon-auth', // Custom storage key
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Use localStorage
    autoRefreshToken: true, // Auto refresh expired tokens
    detectSessionInUrl: true, // Detect auth in URL
    flowType: 'pkce', // Use PKCE flow for better security
  },
});
