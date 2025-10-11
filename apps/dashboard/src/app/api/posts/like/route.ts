import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../../packages/lib/mongodb";
import Like from "../../../../lib/models/Like";

// ✅ GET semua post yang di-like oleh user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // ✅ Ambil semua likes dengan targetType "post"
    const likes = await Like.find({
      userId,
      targetType: "post",
    })
      .select("targetId createdAt")
      .lean();

    // ✅ Format response agar sesuai dengan yang diharapkan frontend
    const formattedLikes = likes.map((like) => ({
      postId: like.targetId,
      createdAt: like.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLikes,
    });
  } catch (error: any) {
    console.error("GET /api/posts/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}