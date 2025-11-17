import { NextRequest, NextResponse } from "next/server";
import connectDB from "@paceon/lib/mongodb";
import Like from "@/lib/models/Like";

interface LikeDocument {
  targetId: string;
  createdAt: Date;
}

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

    const likes = await Like.find({
      userId,
      targetType: "post",
    })
      .select("targetId createdAt")
      .lean() as LikeDocument[];

    const formattedLikes = likes.map((like) => ({
      postId: like.targetId,
      createdAt: like.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLikes,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
