"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Comment } from "../types";

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
  updating
}: EditCommentModalProps) {
  const [editCommentText, setEditCommentText] = useState(comment.content);

  const handleSubmit = async () => {
    if (!editCommentText.trim()) return;

    try {
      await onUpdate(comment._id, editCommentText);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      alert('Error updating comment: ' + errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Edit Comment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <textarea
            placeholder="Write your comment..."
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
            className="w-full min-h-24 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] focus:border-transparent resize-none text-gray-800 mb-3"
          />

          <button
            onClick={handleSubmit}
            disabled={!editCommentText.trim() || updating}
            className="w-full py-2 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Comment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}