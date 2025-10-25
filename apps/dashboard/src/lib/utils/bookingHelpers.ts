// src/lib/bookingHelpers.ts
import { supabase } from "@paceon/lib/supabase";

export const canJoinEvent = async (eventId: string, userId: string) => {
  try {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return { can: false, reason: 'Already booked' };

    const { data: event } = await supabase
      .from('events')
      .select('current_players, max_players, event_status, is_active')
      .eq('id', eventId)
      .single();

    if (!event) return { can: false, reason: 'Event not found' };
    if (!event.is_active) return { can: false, reason: 'Event inactive' };
    if (event.event_status !== 'upcoming') return { can: false, reason: 'Event not upcoming' };
    if (event.current_players >= event.max_players) return { can: false, reason: 'Event full' };

    return { can: true, reason: null };
  } catch (error) {
    return { can: false, reason: 'Validation error' };
  }
};

export const calculateTotalAmount = (basePrice: number) => {
  const ADMIN_FEE = 10000;
  return basePrice + ADMIN_FEE;
};
