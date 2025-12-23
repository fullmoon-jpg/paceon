import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types
interface FormData {
  full_name: string;
  company: string;
  role: string;
  gathering_frequency: string;
  gathering_frequency_other?: string;
  conversation_type: string;
  casual_medium: string;
  casual_medium_other?: string;
  serious_format: string[];
  serious_format_other?: string;
  preferred_locations: string[];
  current_needs: string;
  gathering_topic: string;
  gathering_topic_other?: string;
  small_group_interest: string;
  community_expectations: string;
  podcast_interest: string;
  founder_content_interest: string;
  project_openness: string;
  company_logo_url?: string;
}

interface SupabaseData extends FormData {
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const formData = await request.formData();

    // Extract file
    const logoFile = formData.get('company_logo') as File | null;
    let logoUrl: string | undefined;

    // Upload logo if exists
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community-sensing')
        .upload(filePath, logoFile, {
          contentType: logoFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('community-sensing').getPublicUrl(filePath);

      logoUrl = publicUrl;
    }

    // Parse form data
    const responseData: FormData = {
      full_name: formData.get('full_name') as string,
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      gathering_frequency: formData.get('gathering_frequency') as string,
      gathering_frequency_other:
        (formData.get('gathering_frequency_other') as string) || undefined,
      conversation_type: formData.get('conversation_type') as string,
      casual_medium: formData.get('casual_medium') as string,
      casual_medium_other:
        (formData.get('casual_medium_other') as string) || undefined,
      serious_format: JSON.parse(
        formData.get('serious_format') as string
      ) as string[],
      serious_format_other:
        (formData.get('serious_format_other') as string) || undefined,
      preferred_locations: JSON.parse(
        formData.get('preferred_locations') as string
      ) as string[],
      current_needs: formData.get('current_needs') as string,
      gathering_topic: formData.get('gathering_topic') as string,
      gathering_topic_other:
        (formData.get('gathering_topic_other') as string) || undefined,
      small_group_interest: formData.get('small_group_interest') as string,
      community_expectations: formData.get('community_expectations') as string,
      podcast_interest: formData.get('podcast_interest') as string,
      founder_content_interest: formData.get(
        'founder_content_interest'
      ) as string,
      project_openness: formData.get('project_openness') as string,
      company_logo_url: logoUrl,
    };

    // Validate required fields minimal
    if (!responseData.full_name || !responseData.company || !responseData.role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Insert to Supabase
    const registrationData: SupabaseData = {
      ...responseData,
      created_at: new Date().toISOString(),
    };

    const { data, error: supabaseError } = await supabase
      .from('community_sensing_responses')
      .insert([registrationData])
      .select();

    if (supabaseError) {
      throw new Error(`Database error: ${supabaseError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Response submitted successfully!',
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Submission failed';

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
