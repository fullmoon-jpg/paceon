import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../../../packages/lib/mongodb";
import Post from "../../../../../lib/models/Posts";
import Comment from "../../../../../lib/models/Comment";
import { supabaseAdmin } from "../../../../../../../../packages/lib/supabase";

// GET comments
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: postId } = await context.params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      postId,
      parentCommentId: null,
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({
      postId,
      parentCommentId: null,
    });

    const userIds = [...new Set(comments.map((c) => c.userId))];

    const { data: profiles } = await supabaseAdmin
      .from("users_profile")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const userMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const enrichedComments = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      user: userMap.get(comment.userId) || {
        id: comment.userId,
        full_name: "Unknown User",
        avatar_url: null,
      },
    }));

    return NextResponse.json({
      success: true,
      data: enrichedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { userId, content, parentCommentId } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: "userId and content are required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Comment too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    const { id: postId } = await context.params;

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    // Update counter
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Get commenter profile
    const { data: commenterProfile } = await supabaseAdmin
      .from("users_profile")
      .select("id, full_name, avatar_url")
      .eq("id", userId)
      .single();

    // ✅ Create notification AFTER response (non-blocking)
    if (post.userId !== userId) {
      setImmediate(async () => {
        try {
          const commenterName = commenterProfile?.full_name || "Someone";
          const truncatedComment = content.substring(0, 100) + (content.length > 100 ? "..." : "");

          // ✅ PENTING: metadata harus object, BUKAN string!
          const { error: notifError } = await supabaseAdmin.rpc("create_notification", {
            p_user_id: post.userId,
            p_type: "social",
            p_category: "comment",
            p_title: "New Comment",
            p_message: `${commenterName} commented: "${truncatedComment}"`,
            p_metadata: {  // ← Object, bukan JSON.stringify()
              postId,
              commentId: comment._id.toString(),
              commentContent: content.substring(0, 200),
              postContent: post.content?.substring(0, 100) || "",
            },
            p_actor_id: userId,
            p_related_entity_type: "comment",
          });

          if (notifError) {
            console.error("❌ Notification error:", notifError);
          } else {
            console.log("✅ Comment notification created");
          }

          // ✅ BONUS: Reply notification
          if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment && parentComment.userId !== userId) {
              await supabaseAdmin.rpc("create_notification", {
                p_user_id: parentComment.userId,
                p_type: "social",
                p_category: "comment",
                p_title: "New Reply",
                p_message: `${commenterName} replied to your comment`,
                p_metadata: {
                  postId,
                  commentId: comment._id.toString(),
                  parentCommentId,
                  replyContent: truncatedComment,
                },
                p_actor_id: userId,
                p_related_entity_type: "comment",
              });
              console.log("✅ Reply notification created");
            }
          }
        } catch (err) {
          console.error("❌ Error creating notifications:", err);
        }
      });
    }

    const enrichedComment = {
      ...comment.toObject(),
      _id: comment._id.toString(),
      user: commenterProfile || {
        id: userId,
        full_name: "Unknown User",
        avatar_url: null,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: enrichedComment,
        message: "Comment added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}