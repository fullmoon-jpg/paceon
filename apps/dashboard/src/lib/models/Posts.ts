// src/lib/models/Post.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'image' | 'video';
  location?: string;
  sport?: 'tennis' | 'padel' | 'badminton' | 'other';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
      trim: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10; // Max 10 media files
        },
        message: 'Cannot upload more than 10 media files'
      }
    },
    mediaType: {
      type: String,
      enum: {
        values: ['image', 'video'],
        message: '{VALUE} is not a valid media type'
      },
    },
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      trim: true,
    },
    sport: {
      type: String,
      enum: {
        values: ['tennis', 'padel', 'badminton', 'other'],
        message: '{VALUE} is not a valid sport type'
      },
      lowercase: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative'],
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'Comments count cannot be negative'],
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: [0, 'Shares count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PostSchema.index({ createdAt: -1 }); // Sort by newest
PostSchema.index({ userId: 1, createdAt: -1 }); // User's posts
PostSchema.index({ sport: 1, createdAt: -1 }); // Filter by sport

// Prevent model recompilation in development
const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;