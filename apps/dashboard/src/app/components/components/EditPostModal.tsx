"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Post } from "../types";
import { useToast } from "@/contexts/ToastContext";

interface EditPostModalProps {
  post: Post;
  onUpdate: (
    postId: string,
    postData: {
      content: string;
      location?: string;
      sport?: string;
    }
  ) => Promise<void>;
  onClose: () => void;
  updating: boolean;
}

export default function EditPostModal({
  post,
  onUpdate,
  onClose,
  updating,
}: EditPostModalProps) {
  const [editPostContent, setEditPostContent] = useState(post.content);
  const [editLocation, setEditLocation] = useState(post.location || "");
  const [editSport, setEditSport] = useState(post.sport || "");
  const { showToast } = useToast();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const handleSubmit = async () => {
    if (!editPostContent.trim()) {
      showToast("warning", "Post content cannot be empty");
      return;
    }

    try {
      await onUpdate(post._id, {
        content: editPostContent,
        location: editLocation || undefined,
        sport: editSport || undefined,
      });
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      showToast("error", "Error updating post: " + errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242837] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-[#3d4459]">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#242837] border-b border-gray-200 dark:border-[#3d4459] p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white">
            Edit Post
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4F4EF] dark:hover:bg-[#2d3548] rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
              {post.user.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(post.user.full_name)
              )}
            </div>
            <div>
              <h4 className="font-bold text-[#3F3E3D] dark:text-white">
                {post.user.full_name}
              </h4>
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            placeholder="What's happening in your sports journey?"
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
            className="w-full min-h-32 p-3 border border-gray-300 dark:border-[#3d4459] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] focus:border-transparent resize-none text-[#3F3E3D] dark:text-gray-200 bg-white dark:bg-[#2d3548] placeholder-gray-400 dark:placeholder-gray-500 mb-3"
            autoFocus
          />

          {/* Location & Sport */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Location (optional)"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#3d4459] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] text-sm bg-white dark:bg-[#2d3548] text-[#3F3E3D] dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <select
              value={editSport}
              onChange={(e) => setEditSport(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#3d4459] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] text-sm bg-white dark:bg-[#2d3548] text-[#3F3E3D] dark:text-gray-200"
            >
              <option value="">Select Sport</option>
              <option value="tennis">Tennis</option>
              <option value="padel">Padel</option>
              <option value="badminton">Badminton</option>
              <option value="workshop">Workshop</option>
              <option value="coffee chat">Coffee Chat</option>
              <option value="meet up">Meet Up</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!editPostContent.trim() || updating}
            className="w-full mt-4 py-3 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}