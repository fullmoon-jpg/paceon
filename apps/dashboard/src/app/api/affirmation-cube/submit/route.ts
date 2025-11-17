import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: Submit reviews');

    const { eventId, reviews } = await request.json();

    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify user with authenticated client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }

    console.log('✅ User verified:', user.id);

    // Use ADMIN client untuk bypass RLS
    const reviewsToInsert = reviews.map((review: any) => ({
      event_id: eventId,
      reviewer_id: user.id,
      reviewee_id: review.reviewee_id,
      rating: review.rating,
      feedback: review.feedback || null,
      created_at: new Date().toISOString(),
    }));

    console.log('📋 Inserting reviews:', reviewsToInsert);

    // Insert dengan admin
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('affirmation_cube')
      .insert(reviewsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    console.log('✅ Reviews inserted:', insertData);

    // Update booking dengan admin
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ affirmation_completed: true })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw new Error(`Update failed: ${updateError.message}`);
    }

    console.log('✅ Booking updated');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
