import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';

interface Review {
  reviewee_id: string;
  rating: number;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, reviews } = await request.json();

    // --- Validate Authorization ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // --- Verify user using Admin client ---
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
    }

    // --- Prepare insert payload ---
    const reviewsToInsert = reviews.map((review: Review) => ({
      event_id: eventId,
      reviewer_id: user.id,
      reviewee_id: review.reviewee_id,
      rating: review.rating,
      feedback: review.feedback || null,
      created_at: new Date().toISOString(),
    }));

    // --- Insert reviews (admin bypass RLS) ---
    const { error: insertError } = await supabaseAdmin
      .from('affirmation_cube')
      .insert(reviewsToInsert);

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    // --- Mark booking as completed ---
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ affirmation_completed: true })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
