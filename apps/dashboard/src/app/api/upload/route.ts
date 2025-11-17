import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@paceon/lib/supabase';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

interface StorageError {
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

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

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${userId}/${timestamp}-${random}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    try {
      buffer = await sharp(buffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (err) {
      // Silent optimization skip
    }

    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      const storageError = error as StorageError;
      if (storageError.message.includes('Duplicate')) {
        return NextResponse.json(
          { success: false, error: 'File already exists. Please try again.' },
          { status: 409 }
        );
      }
      throw error;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: buffer.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let fileName: string | null = null;
    
    const { searchParams } = new URL(request.url);
    fileName = searchParams.get('fileName');
    
    if (!fileName) {
      try {
        const body = await request.json();
        fileName = body.fileName as string;
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

    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
