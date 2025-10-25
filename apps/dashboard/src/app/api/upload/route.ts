// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';
import sharp from 'sharp'; // ✅ Optional: for image optimization

// ✅ Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_WIDTH = 1920; // Max image width
const MAX_HEIGHT = 1920; // Max image height

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // ✅ Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max 5MB allowed.' },
        { status: 400 }
      );
    }

    // ✅ Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${userId}/${timestamp}-${random}.${fileExt}`;

    // ✅ Convert and optimize image
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // ✅ Optional: Optimize with sharp (install: npm install sharp)
    
    try {
      buffer = await sharp(buffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (err) {
      console.warn('Image optimization skipped:', err);
    }
    

    // ✅ Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600', // Cache for 1 hour
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Handle specific errors
      if (error.message.includes('Duplicate')) {
        return NextResponse.json(
          { success: false, error: 'File already exists. Please try again.' },
          { status: 409 }
        );
      }
      
      throw error;
    }

    // ✅ Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // ✅ Support both query params and body
    let fileName;
    
    const { searchParams } = new URL(request.url);
    fileName = searchParams.get('fileName');
    
    if (!fileName) {
      try {
        const body = await request.json();
        fileName = body.fileName;
      } catch {
        // No body
      }
    }

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'File name is required' },
        { status: 400 }
      );
    }

    // ✅ Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
