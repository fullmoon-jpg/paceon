import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transporter } from '@/lib/utils/emailservice';
import { loopRegistrationConfirmationTemplate } from '@/app/ui/components/emailtamplateloop';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const institution = formData.get('institution') as string;
    const currentRole = formData.get('currentRole') as string;
    const instagram = formData.get('instagram') as string;
    const hearFrom = formData.get('hearFrom') as string;
    const reason = formData.get('reason') as string;
    const foodChoice = formData.get('foodChoice') as string;
    const drinkChoice = formData.get('drinkChoice') as string;
    const paymentProofFile = formData.get('paymentProof') as File;

    // Validate
    if (!fullName || !email || !phone || !institution || !currentRole || 
        !instagram || !hearFrom || !reason || !foodChoice || !drinkChoice || !paymentProofFile) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi termasuk pilihan makanan & minuman' },
        { status: 400 }
      );
    }

    // Upload payment proof
    const timestamp = Date.now();
    const fileExt = paymentProofFile.name.split('.').pop();
    const fileName = `${timestamp}-${fullName.replace(/\s+/g, '-')}.${fileExt}`;
    
    const arrayBuffer = await paymentProofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(`loop-series/${fileName}`, buffer, {
        contentType: paymentProofFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Gagal upload bukti bayar' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(`loop-series/${fileName}`);

    // Insert to database - STATUS: CONFIRMED
    const { data: insertData, error: insertError } = await supabase
      .from('loop_registrations')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          institution: institution,
          participant_role: currentRole,
          instagram: instagram,
          hear_from: hearFrom,
          reason: reason,
          food_choice: foodChoice,
          drink_choice: drinkChoice,
          payment_proof_url: publicUrl,
          payment_status: 'confirmed',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan registrasi' },
        { status: 500 }
      );
    }

    // Send CONFIRMATION email
    try {
      const emailHtml = loopRegistrationConfirmationTemplate({
        name: fullName,
        email: email,
        phone: phone,
        institution: institution,
        instagram: instagram,
        foodChoice: FOOD_OPTIONS.find(f => f.value === foodChoice)?.label || foodChoice,
        drinkChoice: DRINK_OPTIONS.find(d => d.value === drinkChoice)?.label || drinkChoice
      });

      const mailOptions = {
        from: '"PACE ON - LOOP Series" <hi@paceon.id>',
        to: email,
        subject: '🎉 LOOP #1 - Pembayaran Dikonfirmasi! Kamu Terdaftar!',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successfully to:', email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registrasi berhasil! Email konfirmasi sudah dikirim.',
        data: insertData[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// Food & Drink options for email template
const FOOD_OPTIONS = [
  { value: 'tuna_sandwich', label: 'Tuna Sandwich' },
  { value: 'chicken_mushroom_sandwich', label: 'Chicken Mushroom Sandwich' },
  { value: 'beef_sandwich', label: 'Beef Sandwich' },
  { value: 'cheese_toast', label: 'Cheese Toast' },
  { value: 'banana_toast', label: 'Banana Toast' },
  { value: 'chocolate_toast', label: 'Chocolate Toast' },
];

const DRINK_OPTIONS = [
  { value: 'cappuccino', label: 'Cappuccino' },
  { value: 'latte', label: 'Latte' },
  { value: 'magic', label: 'Magic' },
  { value: 'piccolo', label: 'Piccolo' },
  { value: 'americano', label: 'Americano' },
  { value: 'flat_white', label: 'Flat White' },
];