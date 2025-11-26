import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';
import { transporter } from '@/lib/utils/emailService';
import { eventCompletedEmailTemplate } from '@/lib/utils/feedbackemail'; // sesuaikan path

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Update event status
    const { error: eventError, data: eventData } = await supabaseAdmin
      .from('events')
      .update({ event_status: 'completed' })
      .eq('id', eventId)
      .select('id, title, start_time, location')
      .single();
    if (eventError) throw eventError;

    // Update booking status
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'attended' })
      .eq('event_id', eventId);
    if (bookingError) throw bookingError;

    // Get attended bookings with user info
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('user_id, users:users!inner(id, full_name, email)')
      .eq('event_id', eventId)
      .eq('booking_status', 'attended');
    if (bookingsError) throw bookingsError;

    // Auto-create user connections between attendees
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

    // Kirim email feedback dan affirmation cube ke peserta hadir
    if (bookings && bookings.length > 0) {
      const uniqueUsers = new Map();
      bookings.forEach(b => {
        if (b.users?.id && b.users?.email) {
          uniqueUsers.set(b.users.id, b.users);
        }
      });

      const eventDateStr = eventData?.start_time
        ? new Date(eventData.start_time).toLocaleDateString('id-ID')
        : '';

      for (const user of uniqueUsers.values()) {
        const html = eventCompletedEmailTemplate(user.full_name ?? 'PACE ON Player', eventDateStr);

        await transporter.sendMail({
          from: `"PACE ON" <hi@paceon.id>`,
          to: user.email,
          subject: `Thank you for joining - ${eventData?.title ?? 'PACE ON Event'}`,
          html,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
