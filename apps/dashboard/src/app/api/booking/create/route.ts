// src/app/api/bookings/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';
import { bookingConfirmationEmailTemplate } from '@/lib/utils/paymentTamplate';
import { transporter } from '@/lib/utils/emailService';

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();
    console.log('Request received:', { eventId, userId });

    if (!eventId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or userId' },
        { status: 400 }
      );
    }

    // -------------------------------
    // 1. Check existing booking
    // -------------------------------
    const { data: existingBooking, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select('id, booking_status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      return NextResponse.json({ success: false, error: 'Database error while checking booking.' }, { status: 500 });
    }

    if (existingBooking) {
      if (existingBooking.booking_status === 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'You cancelled this booking. Please contact admin.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'You already have a booking!' },
        { status: 400 }
      );
    }

    // -------------------------------
    // 2. Verify event availability
    // -------------------------------
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        title,
        event_date,
        start_time,
        venue_name,
        max_players,
        current_players,
        event_status,
        is_active,
        price_per_person
      `)
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!eventData.is_active) return errorResponse('Event no longer active');
    if (eventData.event_status === 'cancelled') return errorResponse('Event cancelled');
    if (eventData.event_status === 'completed') return errorResponse('Event ended');

    if (eventData.current_players >= eventData.max_players) {
      return errorResponse('Event full!');
    }

    // -------------------------------
    // 3. Get user profile
    // -------------------------------
    const { data: user, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // -------------------------------
    // 4. Calculate total amount
    // -------------------------------
    const fee = 10000;
    const totalAmount = eventData.price_per_person + fee;

    // -------------------------------
    // 5. Create booking
    // -------------------------------
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        event_id: eventId,
        user_id: userId,
        booking_status: 'pending',
        amount_to_pay: totalAmount,
        has_paid: false,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // -------------------------------
    // 6. Create payment record
    // -------------------------------
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: booking.id,
        user_id: userId,
        event_id: eventId,
        amount: totalAmount,
        payment_status: 'pending',
        payment_method: 'pending',
      });

    if (paymentError) {
      // Rollback
      await supabaseAdmin.from('bookings').delete().eq('id', booking.id);
      throw new Error('Failed to create payment');
    }

    // -------------------------------
    // 7. Invoice + Due date
    // -------------------------------
    const invoiceNumber = `INV-${booking.id}-${Date.now()}`;

    const dueDate = new Date(eventData.event_date);
    dueDate.setDate(dueDate.getDate() - 1);

    // -------------------------------
    // 8. Send email
    // -------------------------------
    console.log('Sending email to:', user.email);

    await transporter.sendMail({
      from: `"PACE ON" <${process.env.MAILSPACE_USER}>`,
      to: user.email,
      subject: `Payment Invoice - ${eventData.title}`,
      html: bookingConfirmationEmailTemplate({
        name: user.full_name,
        eventTitle: eventData.title,
        eventDate: new Date(eventData.event_date).toLocaleDateString('id-ID'),
        eventTime: eventData.start_time || '14:00',
        eventLocation: eventData.venue_name,
        invoiceNumber,
        amount: `Rp ${totalAmount.toLocaleString('id-ID')}`,
        dueDate: dueDate.toLocaleDateString('id-ID'),
      }),
    });

    console.log('Email sent successfully');

    // -------------------------------
    // 9. Save invoice number
    // -------------------------------
    await supabaseAdmin
      .from('bookings')
      .update({ invoice_number: invoiceNumber })
      .eq('id', booking.id);

    return NextResponse.json({
      success: true,
      booking,
      invoiceNumber,
      message: 'Booking successful! Invoice sent to your email.',
    });

  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper buat return error cepat
function errorResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}
