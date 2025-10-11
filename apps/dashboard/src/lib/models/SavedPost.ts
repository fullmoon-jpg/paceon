// src/lib/models/SavedPost.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPost extends Document {
  userId: string;
  postId: string;
  createdAt: Date;
}

const SavedPostSchema = new Schema<ISavedPost>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    postId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index untuk ensure user gak bisa save post yang sama 2x
SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.models.SavedPost || 
  mongoose.model<ISavedPost>('SavedPost', SavedPostSchema);