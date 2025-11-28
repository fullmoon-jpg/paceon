"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface ShareModalProps {
  postId: string;
  onClose: () => void;
}

export default function ShareModal({ postId, onClose }: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyShareLink = () => {
    const link = `${window.location.origin}/activityfeed/post/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const shareUrl = `${window.location.origin}/activityfeed/post/${postId}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242837] rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-[#3d4459]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#3d4459] p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3F3E3D] dark:text-white">
            Share Post
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Share this post with others
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-[#F4F4EF] dark:bg-[#2d3548] border border-gray-300 dark:border-[#3d4459] rounded-lg text-sm text-gray-700 dark:text-gray-300"
            />
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-[#FB6F7A] hover:bg-[#F47A49] text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>

          {copySuccess && (
            <div className="text-sm text-[#21C36E] dark:text-[#21C36E] text-center bg-[#21C36E]/10 dark:bg-[#21C36E]/20 py-2 rounded-lg">
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}