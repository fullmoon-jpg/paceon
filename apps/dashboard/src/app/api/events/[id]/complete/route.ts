// src/app/api/events/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const { error: eventError } = await supabaseAdmin
      .from('events')
      .update({ event_status: 'completed' })
      .eq('id', eventId);

    if (eventError) throw eventError;

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'attended' })
      .eq('event_id', eventId);

    if (bookingError) throw bookingError;

    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('booking_status', 'attended');

    if (bookings && bookings.length > 1) {
      const connections = [];
      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          connections.push({
            user_id: bookings[i].user_id,
            connected_user_id: bookings[j].user_id,
          });
          connections.push({
            user_id: bookings[j].user_id,
            connected_user_id: bookings[i].user_id,
          });
        }
      }

      if (connections.length > 0) {
        const { error: connError } = await supabaseAdmin
          .from('user_connections')
          .insert(connections);

        if (connError) console.error('Connection error:', connError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
