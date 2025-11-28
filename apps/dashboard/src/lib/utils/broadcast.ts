import { supabase } from '@paceon/lib/supabaseclient';

interface BroadcastPayload {
  [key: string]: unknown;
}

export async function broadcastFeedUpdate(event: string, payload: BroadcastPayload) {
  try {
    const channel = supabase.channel('feed-updates');
    
    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    return true;
  } catch {
    return false;
  }
}
