import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import SavedPost from '@/lib/models/SavedPost';
import { Types } from 'mongoose';

interface SavedPostDocument {
  _id: Types.ObjectId;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface SavedPostLean {
  _id: unknown;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface MongoError extends Error {
  code?: number;
}

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

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [savedPostsRaw, total] = await Promise.all([
      SavedPost.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<SavedPostLean[]>(),
      SavedPost.countDocuments({ userId })
    ]);

    // Transform to include _id as string
    const savedPosts = savedPostsRaw.map(post => ({
      ...post,
      _id: post._id?.toString() || '',
    }));

    return NextResponse.json({
      success: true,
      data: savedPosts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('GET /api/saved-posts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const userId = body.userId as string | undefined;
    const postId = body.postId as string | undefined;

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    const savedPost = await SavedPost.findOneAndUpdate(
      { userId, postId },
      { userId, postId, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean<SavedPostLean>();

    // Transform _id to string
    const transformedPost = savedPost ? {
      ...savedPost,
      _id: savedPost._id?.toString() || '',
    } : null;

    return NextResponse.json({
      success: true,
      data: transformedPost,
      message: 'Post saved successfully',
    });
  } catch (error) {
    const mongoError = error as MongoError;
    
    if (mongoError.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Post already saved' },
        { status: 400 }
      );
    }
    
    console.error('POST /api/saved-posts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    let userId: string | null = null;
    let postId: string | null = null;
    
    try {
      const body = await request.json();
      userId = body.userId as string;
      postId = body.postId as string;
    } catch {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId');
      postId = searchParams.get('postId');
    }

    if (!userId || !postId) {
      return NextResponse.json(
        { success: false, error: 'userId and postId are required' },
        { status: 400 }
      );
    }

    const result = await SavedPost.deleteOne({ userId, postId });

    return NextResponse.json({
      success: true,
      message: result.deletedCount > 0 ? 'Post unsaved successfully' : 'Post was not saved',
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error('DELETE /api/saved-posts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}