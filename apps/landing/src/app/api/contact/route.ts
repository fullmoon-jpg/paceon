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

// Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json() as ContactData;

    // Validate required fields
    if (!body.name || !body.email || !body.company || !body.message_type || !body.message) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Insert to Supabase
    const { data, error: supabaseError } = await supabase
      .from('contacts')
      .insert([{
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company,
        message_type: body.message_type,
        message: body.message,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (supabaseError) {
      throw new Error(`Database error: ${supabaseError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message submitted successfully!',
      data: data
    }, { status: 200 });

  } catch (error) {
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
