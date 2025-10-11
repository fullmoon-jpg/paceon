// src/lib/models/Like.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILike extends Document {
  userId: string;
  targetType: "post" | "comment";
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      enum: ["post", "comment"],
    },
    targetId: {
      type: String,
      required: [true, "Target ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false, // biar gak ada __v
  }
);

// ✅ Compound index: user hanya bisa like 1x per target
LikeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// ✅ Index tambahan untuk perhitungan cepat
LikeSchema.index({ targetType: 1, targetId: 1 });

// ✅ Gunakan global cache model biar gak recompile di dev
const Like =
  (mongoose.models.Like as Model<ILike>) ||
  mongoose.model<ILike>("Like", LikeSchema);

export default Like;
