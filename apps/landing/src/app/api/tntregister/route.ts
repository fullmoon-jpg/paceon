// app/api/talk-n-tales/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transporter } from '@/lib/utils/emailservice'; 
import { talkNTalesRegistrationConfirmationTemplate } from '@/app/ui/components/emailtamplatetnt'; 

// Types
interface RegistrationData {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  role: string;
  company: string;
  company_industry: string;
  domicile: string;
  source: string;
  interests: string[];
  reason?: string | null;
}

interface SupabaseRegistration extends RegistrationData {
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

// Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json() as RegistrationData;

    // Validate required fields
    if (!body.full_name || !body.email || !body.phone) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Insert to Supabase
    const registrationData: SupabaseRegistration = {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      linkedin_url: body.linkedin_url,
      role: body.role,
      company: body.company,
      company_industry: body.company_industry,
      domicile: body.domicile,
      source: body.source,
      interests: body.interests,
      reason: body.reason || null,
      created_at: new Date().toISOString()
    };

    const { data, error: supabaseError } = await supabase
      .from('talk_n_tales_registrations')
      .insert([registrationData])
      .select();

    if (supabaseError) {
      throw new Error(`Database error: ${supabaseError.message}`);
    }

    // Send confirmation email
    const emailHtml = talkNTalesRegistrationConfirmationTemplate({
      name: body.full_name,
      email: body.email,
      eventDate: 'Saturday, December 13, 2025',
      eventTime: '15:00 - 22:00',
      eventLocation: 'TBA (will be announced soon)'
    });

    const mailOptions = {
      from: '"PACE ON - Talk n Tales" <hi@paceon.id>',
      to: body.email,
      subject: 'Talk n Tales - Registration Confirmed!',
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Registration successful and confirmation email sent!',
      data: data
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Registration failed';

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorMessage
    }, { status: 500 });
  }
}