// src/lib/utils/broadcast.ts
import { supabase } from '@paceon/lib/supabase';

export async function broadcastFeedUpdate(event: string, payload: any) {
  try {
    const channel = supabase.channel('feed-updates');
    
    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    console.log(`✅ Broadcasted ${event}`);
    return true;
  } catch (error) {
    console.error(`❌ Broadcast failed for ${event}:`, error);
    return false;
  }
}
