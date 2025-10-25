// src/app/api/saved-posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@paceon/lib/mongodb';
import SavedPost from '@/lib/models/SavedPost';

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

    // ✅ Add pagination support
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // ✅ Parallel queries
    const [savedPosts, total] = await Promise.all([
      SavedPost.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedPost.countDocuments({ userId })
    ]);

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
  } catch (error: any) {
    console.error('GET /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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

    // ✅ Use upsert to avoid duplicate check
    const savedPost = await SavedPost.findOneAndUpdate(
      { userId, postId },
      { userId, postId, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: savedPost,
      message: 'Post saved successfully',
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Post already saved' },
        { status: 400 }
      );
    }
    
    console.error('POST /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // ✅ Support both body and query params
    let userId, postId;
    
    try {
      const body = await request.json();
      userId = body.userId;
      postId = body.postId;
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
  } catch (error: any) {
    console.error('DELETE /api/saved-posts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
