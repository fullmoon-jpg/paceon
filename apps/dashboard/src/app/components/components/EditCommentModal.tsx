"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Comment } from "../types";
import { useToast } from "@/contexts/ToastContext";

interface EditCommentModalProps {
  comment: Comment;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onClose: () => void;
  updating: boolean;
}

export default function EditCommentModal({
  comment,
  onUpdate,
  onClose,
  updating,
}: EditCommentModalProps) {
  const [editCommentText, setEditCommentText] = useState(comment.content);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!editCommentText.trim()) {
      showToast("warning", "Comment cannot be empty");
      return;
    }

    try {
      await onUpdate(comment._id, editCommentText);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      showToast("error", "Error updating comment: " + errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242837] rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-[#3d4459]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#3d4459] p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3F3E3D] dark:text-white">
            Edit Comment
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            placeholder="Write your comment..."
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
            className="w-full min-h-24 p-3 border border-gray-300 dark:border-[#3d4459] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent resize-none text-[#3F3E3D] dark:text-gray-200 bg-white dark:bg-[#2d3548] placeholder-gray-400 dark:placeholder-gray-500 mb-3"
            autoFocus
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!editCommentText.trim() || updating}
            className="w-full py-2 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Comment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}