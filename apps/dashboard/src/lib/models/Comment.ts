import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: String,
      required: [true, 'Post ID is required'],
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative'],
    },
    parentCommentId: {
      type: String,
      index: true, // ✅ biarkan ini aja, jangan bikin index manual lagi
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ✅ Index tambahan (hanya yang belum di-declare di field)
CommentSchema.index({ postId: 1, createdAt: 1 });

// ✅ Virtual untuk replies (future-proof)
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
});

// ✅ Cegah model double compile
const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
