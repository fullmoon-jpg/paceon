import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';
import { transporter } from '@/lib/utils/emailService';
import { eventCompletedEmailTemplate } from '@/lib/utils/feedbackemail';

// Define proper types
interface UserData {
  id: string;
  full_name: string;
  email: string;
}

interface EventData {
  id: string;
  title: string;
  start_time: string;
}

interface BookingWithUser {
  user_id: string;
  users_profile: UserData;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: params must be awaited (NextJS 15+)
    const { id: eventId } = await context.params;

    // 1. Update event status
    const { error: eventError, data: eventData } = await supabaseAdmin
      .from('events')
      .update({ event_status: 'completed' })
      .eq('id', eventId)
      .select('id, title, start_time')
      .single<EventData>();

    if (eventError) throw eventError;

    // 2. Update booking status
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'attended' })
      .eq('event_id', eventId);

    if (bookingError) throw bookingError;

    // 3. Get attended bookings + user info
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        user_id,
        users_profile!inner(id, full_name, email)
      `)
      .eq('event_id', eventId)
      .eq('booking_status', 'attended')
      .returns<BookingWithUser[]>();

    if (bookingsError) throw bookingsError;

    // 4. Auto-create user connections
    if (bookings && bookings.length > 1) {
      const connections: Array<{ user_id: string; connected_user_id: string }> = [];

      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          connections.push(
            { user_id: bookings[i].user_id, connected_user_id: bookings[j].user_id },
            { user_id: bookings[j].user_id, connected_user_id: bookings[i].user_id }
          );
        }
      }

      if (connections.length > 0) {
        const { error: connError } = await supabaseAdmin
          .from('user_connections')
          .insert(connections);

        if (connError) console.error('Connection error:', connError);
      }
    }

    // 5. Send email to all attendees
    if (bookings && bookings.length > 0) {
      const uniqueUsers = new Map<string, UserData>();

      // Type-safe access to users_profile
      bookings.forEach((booking: BookingWithUser) => {
        if (booking.users_profile?.id) {
          uniqueUsers.set(booking.users_profile.id, booking.users_profile);
        }
      });

      const eventDateStr = eventData?.start_time
        ? new Date(eventData.start_time).toLocaleDateString('id-ID')
        : '';

      for (const user of uniqueUsers.values()) {
        try {
          const html = eventCompletedEmailTemplate(
            user.full_name ?? 'PACE ON Player',
            eventDateStr
          );

          await transporter.sendMail({
            from: `"PACE ON" <hi@paceon.id>`,
            to: user.email,
            subject: `Thank you for joining - ${eventData?.title ?? 'PACE ON Event'}`,
            html,
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Complete event error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}