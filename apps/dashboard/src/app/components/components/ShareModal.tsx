"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface ShareModalProps {
  postId: string;
  onClose: () => void;
}

export default function ShareModal({
  postId,
  onClose
}: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyShareLink = () => {
    const link = `${window.location.origin}/activityfeed/post/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Share Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Share this post with others</p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={`${window.location.origin}/activity-feed/post/${postId}`}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
            />
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-[#15b392] text-white rounded-lg hover:bg-[#2a6435] transition-colors font-medium text-sm flex items-center gap-2"
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
            <div className="text-sm text-green-600 text-center bg-green-50 py-2 rounded-lg">
              ✓ Link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}