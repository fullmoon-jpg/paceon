import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../../../packages/lib/mongodb";
import Post from "../../../../../lib/models/Posts";
import Like from "../../../../../lib/models/Like";
import { supabaseAdmin } from "../../../../../../../../packages/lib/supabase";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;
    await connectDB();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const session = await Like.startSession();
    session.startTransaction();

    try {
      const existingLike = await Like.findOne({
        userId,
        targetType: "post",
        targetId: postId,
      }).session(session);

      let isLiked = false;
      let likesCount = post.likesCount;

      if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id }).session(session);
        likesCount = Math.max(0, likesCount - 1);
        await Post.findByIdAndUpdate(postId, { likesCount }).session(session);
        isLiked = false;
      } else {
        // Like
        await Like.create(
          [{ userId, targetType: "post", targetId: postId }],
          { session }
        );

        likesCount += 1;
        await Post.findByIdAndUpdate(postId, { likesCount }).session(session);
        isLiked = true;
      }

      // ✅ COMMIT TRANSACTION DULU sebelum create notification
      await session.commitTransaction();
      session.endSession();

      // ✅ Create notification SETELAH transaction selesai (non-blocking)
      if (isLiked && post.userId !== userId) {
        // Fire and forget - jangan block response
        setImmediate(async () => {
          try {
            const { data: likerProfile } = await supabaseAdmin
              .from("users_profile")
              .select("full_name")
              .eq("id", userId)
              .single();

            const likerName = likerProfile?.full_name || "Someone";

            // ✅ PENTING: metadata harus object, BUKAN string!
            const { error: notifError } = await supabaseAdmin.rpc("create_notification", {
              p_user_id: post.userId,
              p_type: "social",
              p_category: "like",
              p_title: "New Like",
              p_message: `${likerName} liked your post`,
              p_metadata: {  // ← Object, bukan JSON.stringify()
                postId: postId,
                postContent: post.content?.substring(0, 100) || "",
              },
              p_actor_id: userId,
              p_related_entity_type: "post",
            });

            if (notifError) {
              console.error("❌ Notification error:", notifError);
            } else {
              console.log("✅ Like notification created");
            }
          } catch (err) {
            console.error("❌ Error creating like notification:", err);
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: { isLiked, likesCount },
        message: isLiked ? "Post liked" : "Post unliked",
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error: any) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}