import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  message_type: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

// Supabase client dengan SERVICE ROLE KEY (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Pastikan env var ini ada!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json() as ContactData;

    // Validasi required fields
    if (!body.name || !body.email || !body.company || !body.message_type || !body.message) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Insert ke Supabase (service role bypass RLS)
    const { data, error: supabaseError } = await supabase
      .from('contacts')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        company: body.company.trim(),
        message_type: body.message_type,
        message: body.message.trim(),
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw new Error(`Database error: ${supabaseError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message submitted successfully!',
      data: data
    }, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Submission failed';

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorMessage
    }, { status: 500 });
  }
}