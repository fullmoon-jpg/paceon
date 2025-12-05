import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params; // uuid di sini sebenernya adalah id dari supabase
    
    // ✅ Pake service role key untuk bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Query data peserta dari talk_n_tales_registrations by id (bukan uuid)
    const { data: registration, error } = await supabase
      .from('talk_n_tales_registrations')
      .select('*')
      .eq('id', uuid) // ✅ Ganti jadi 'id'
      .single();

    console.log('Query result:', { registration, error });

    if (error || !registration) {
      console.error('Error finding ticket:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ticket not found or invalid' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ticket is valid',
        data: registration
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}