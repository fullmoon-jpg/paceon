"use client";

import { useState } from "react";
import { X, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface CreatePostModalProps {
  currentUserId: string;
  currentUserName: string;
  avatar_url?: string;
  currentUserPosition?: string;
  currentUserCompany?: string;
  onCreate: (postData: {
    content: string;
    mediaFiles: File[];
    location?: string;
    sport?: string;
  }) => Promise<void>;
  onClose: () => void;
  creating: boolean;
}

export default function CreatePostModal({
  currentUserId,
  currentUserName,
  avatar_url,
  currentUserPosition,
  currentUserCompany,
  onCreate,
  onClose,
  creating
}: CreatePostModalProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState<string>("");
  const { showToast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviewImages([...previewImages, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages([...selectedImages, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newPostContent.trim()) {
      showToast('warning', 'Please write something before posting');
      return;
    }

    try {
      await onCreate({
        content: newPostContent,
        mediaFiles: selectedImages,
        location: location || undefined,
        sport: sport || undefined,
      });
      
      setNewPostContent("");
      setSelectedImages([]);
      setPreviewImages([]);
      setLocation("");
      setSport("");
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      showToast('error', 'Error creating post: ' + errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Create Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
              {avatar_url ? (
                <img src={avatar_url} alt={currentUserName} className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUserName)
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">{currentUserName}</h4>
              {(currentUserPosition || currentUserCompany) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUserPosition && currentUserCompany 
                    ? `${currentUserPosition} at ${currentUserCompany}`
                    : currentUserPosition || currentUserCompany
                  }
                </p>
              )}
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            placeholder="What's happening in your sports journey?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full min-h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 focus:border-transparent resize-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 mb-3"
          />

          {/* Location & Sport */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392] dark:focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Select Type of Event</option>
              <option value="tennis">Tennis</option>
              <option value="padel">Padel</option>
              <option value="badminton">Badminton</option>
              <option value="workshop">Workshop</option>
              <option value="coffee chat">Coffee chat</option>
              <option value="meet up">Meet up</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {previewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Media Section */}
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add to your post</p>
            <div className="flex gap-2">
              <button
                onClick={() => document.getElementById("image-upload-input")?.click()}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
              >
                <ImageIcon size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo</span>
              </button>

              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!newPostContent.trim() || creating}
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
