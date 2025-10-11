// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../packages/lib/mongodb';
import Post from '../../../../lib/models/Posts';
import Comment from '../../../../lib/models/Comment';
import Like from '../../../../lib/models/Like';
import { supabaseAdmin } from '../../../../../../../packages/lib/supabase';

// ✅ GET /api/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const post = await Post.findById(id).lean();
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // ✅ Ambil data user dari Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .select('id, full_name, avatar_url')
      .eq('id', post.userId)
      .single();

    if (profileError) {
      console.warn('Supabase profile fetch warning:', profileError.message);
    }

    const enrichedPost = {
      ...post,
      _id: post._id.toString(),
      user: profile || {
        id: post.userId,
        full_name: 'Unknown User',
        avatar_url: null,
      },
    };

    return NextResponse.json({
      success: true,
      data: enrichedPost,
    });
  } catch (error: any) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/posts/[id] - Delete post + related data + Supabase images
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const userId = post.userId;
    const mediaUrls = post.mediaUrls || [];

    // ✅ Hapus post + komentar + like terkait
    await Promise.all([
      Post.findByIdAndDelete(id),
      Comment.deleteMany({ postId: id }),
      Like.deleteMany({ targetType: 'post', targetId: id }),
    ]);

    // ✅ Hapus file dari Supabase Storage
    if (mediaUrls.length > 0) {
      try {
        // Ubah URL penuh jadi relative path untuk remove()
        const filePaths = mediaUrls
          .map((url: string) => {
            const parts = url.split('/storage/v1/object/public/uploads/');
            return parts[1] ? decodeURIComponent(parts[1]) : null;
          })
          .filter(Boolean) as string[];

        if (filePaths.length > 0) {
          const { error: deleteError } = await supabaseAdmin
            .storage
            .from('uploads')
            .remove(filePaths);

          if (deleteError) {
            console.error('❌ Supabase delete error:', deleteError.message);
          } else {
            console.log('✅ Supabase files deleted:', filePaths);
          }
        }
      } catch (err: any) {
        console.error('⚠️ Failed to delete Supabase images:', err.message);
      }
    }

    // ✅ Update statistik di Supabase
    const { error: statsError } = await supabaseAdmin.rpc(
      'decrement_total_posts',
      { p_user_id: userId }
    );
    if (statsError) {
      console.error('Error decrementing total_posts:', statsError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Post and associated data deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH /api/posts/[id] - Edit post
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { content, location, sport } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Content too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    const updateData: any = {
      content,
      updatedAt: new Date(),
    };

    if (location !== undefined) updateData.location = location;
    if (sport !== undefined) updateData.sport = sport ? sport.toLowerCase() : undefined;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: updatedPost.content,
        location: updatedPost.location,
        sport: updatedPost.sport,
        updatedAt: updatedPost.updatedAt,
      },
      message: 'Post updated successfully',
    });
  } catch (error: any) {
    console.error('PATCH /api/posts/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
