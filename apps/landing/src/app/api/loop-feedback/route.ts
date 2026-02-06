import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabaseadmin';

// Type definitions
interface LoopFeedbackRequest {
  userEmail: string;
  userName: string;
  overallSatisfaction: number;
  eventFormatEffectiveness: number;
  contentCreationUnderstanding: number;
  speakerInsightRelevance: number;
  moderatorPerformance: number;
  networkingSessionQuality: number;
  venueCondition: number;
  foodAndBeverage: number;
  attendeeCount: string;
  practicalUnderstanding: string;
  mostLiked: string;
  improvements: string;
  interestedNextEvent: string;
  eventDate: string;
}

// Validation helper
function validateRating(rating: number, fieldName: string): string | null {
  if (!rating || rating < 1 || rating > 5) {
    return `${fieldName} harus antara 1-5`;
  }
  return null;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: LoopFeedbackRequest = await request.json();

    // Validation
    const errors: string[] = [];

    // Required text fields
    if (!body.userEmail || !body.userEmail.trim()) {
      errors.push('Email wajib diisi');
    } else if (!validateEmail(body.userEmail)) {
      errors.push('Format email tidak valid');
    }

    if (!body.userName || !body.userName.trim()) {
      errors.push('Nama wajib diisi');
    }

    // Validate ratings
    const ratingFields = [
      { value: body.overallSatisfaction, name: 'Overall Satisfaction' },
      { value: body.eventFormatEffectiveness, name: 'Event Format' },
      { value: body.contentCreationUnderstanding, name: 'Content Understanding' },
      { value: body.speakerInsightRelevance, name: 'Speaker Insight' },
      { value: body.moderatorPerformance, name: 'Moderator Performance' },
      { value: body.networkingSessionQuality, name: 'Networking Quality' },
      { value: body.venueCondition, name: 'Venue Condition' },
      { value: body.foodAndBeverage, name: 'Food & Beverage' },
    ];

    ratingFields.forEach(field => {
      const error = validateRating(field.value, field.name);
      if (error) errors.push(error);
    });

    // Validate multiple choice fields
    if (!body.attendeeCount || !body.attendeeCount.trim()) {
      errors.push('Pilihan jumlah peserta wajib diisi');
    }

    if (!body.practicalUnderstanding || !body.practicalUnderstanding.trim()) {
      errors.push('Pilihan pemahaman praktis wajib diisi');
    }

    if (!body.interestedNextEvent || !body.interestedNextEvent.trim()) {
      errors.push('Pilihan ketertarikan event berikutnya wajib diisi');
    }

    if (!body.eventDate) {
      errors.push('Event date wajib diisi');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors 
        },
        { status: 400 }
      );
    }

    // Insert to database using admin client (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('loop_feedback')
      .insert([{
        user_email: body.userEmail.trim().toLowerCase(),
        user_name: body.userName.trim(),
        overall_satisfaction: body.overallSatisfaction,
        event_format_effectiveness: body.eventFormatEffectiveness,
        content_creation_understanding: body.contentCreationUnderstanding,
        speaker_insight_relevance: body.speakerInsightRelevance,
        moderator_performance: body.moderatorPerformance,
        networking_session_quality: body.networkingSessionQuality,
        venue_condition: body.venueCondition,
        food_and_beverage: body.foodAndBeverage,
        attendee_count: body.attendeeCount,
        practical_understanding: body.practicalUnderstanding,
        most_liked: body.mostLiked?.trim() || null,
        improvements: body.improvements?.trim() || null,
        interested_next_event: body.interestedNextEvent,
        event_date: body.eventDate,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Check for duplicate submission (if you want to prevent it)
      if (error.code === '23505') { // PostgreSQL unique violation
        return NextResponse.json(
          { 
            success: false, 
            message: 'Kamu sudah submit feedback untuk event ini' 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'Gagal menyimpan feedback. Silakan coba lagi.' 
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback berhasil dikirim!',
        data: {
          id: data.id,
          submittedAt: data.submitted_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in loop-feedback API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan server. Silakan coba lagi.' 
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve feedback (for admin/user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const eventDate = searchParams.get('eventDate');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('loop_feedback')
      .select('*')
      .eq('user_email', email.toLowerCase());

    if (eventDate) {
      query = query.eq('event_date', eventDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET loop-feedback API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}