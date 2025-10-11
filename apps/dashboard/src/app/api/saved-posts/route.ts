// src/app/api/saved-posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../packages/lib/mongodb';
import SavedPost from '../../../lib/models/SavedPost';

// GET /api/saved-posts - Get user's saved posts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const savedPosts = await SavedPost.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: savedPosts,
    });
  } catch (error: any) {
    console.error('GET /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/saved-posts - Save a post
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId, postId } = await request.json();

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await SavedPost.findOne({ userId, postId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Post already saved' },
        { status: 400 }
      );
    }

    const savedPost = await SavedPost.create({ userId, postId });

    return NextResponse.json({
      success: true,
      data: savedPost,
      message: 'Post saved successfully',
    });
  } catch (error: any) {
    console.error('POST /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-posts - Unsave a post
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { userId, postId } = await request.json();

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    await SavedPost.deleteOne({ userId, postId });

    return NextResponse.json({
      success: true,
      message: 'Post unsaved successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}