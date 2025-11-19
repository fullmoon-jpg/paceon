import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface Review {
  reviewee_id: string;
  rating: number;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }

    // Use ADMIN client untuk bypass RLS
    const reviewsToInsert = reviews.map((review: Review) => ({
      event_id: eventId,
      reviewer_id: user.id,
      reviewee_id: review.reviewee_id,
      rating: review.rating,
      feedback: review.feedback || null,
      created_at: new Date().toISOString(),
    }));

    // Insert dengan admin
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('affirmation_cube')
      .insert(reviewsToInsert)
      .select();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // Update booking dengan admin
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ affirmation_completed: true })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}