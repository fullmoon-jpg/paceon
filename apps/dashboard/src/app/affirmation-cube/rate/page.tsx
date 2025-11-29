"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabaseclient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Star, Send, CheckCircle, Trophy, Users, ArrowLeft, Sparkles } from "lucide-react";

interface Teammate {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

interface Review {
  reviewee_id: string;
  rating: number;
  feedback: string;
}

interface Event {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

interface Booking {
  user_id: string;
}

// Skeleton Components
function SkeletonHeader() {
  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-[#3d4459] animate-pulse">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-4" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
      <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#2d3548] rounded-2xl shadow-md p-8 mb-6 border border-gray-200 dark:border-[#3d4459] animate-pulse">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto" />
      </div>
      <div className="mb-6">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-3" />
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2" />
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

const AffirmationCubePage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("event_id");
    if (id) {
      setEventId(id);
    } else {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user && eventId) {
      fetchEventAndTeammates();
    } else if (!loading && !user) {
      setPageLoading(false);
    }
  }, [loading, user, eventId]);

  const fetchEventAndTeammates = async () => {
    if (!user || !eventId) {
      setPageLoading(false);
      return;
    }

    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData as Event);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("user_id")
        .eq("event_id", eventId)
        .eq("booking_status", "attended")
        .neq("user_id", user.id);

      if (bookingsError) throw bookingsError;

      const userIds = (bookingsData || []).map((b: Booking) => b.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("users_profile")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const userMap = new Map(
        (profilesData || []).map((p: UserProfile) => [p.id, p])
      );

      const teammatesData: Teammate[] = userIds
        .map((userId: string) => {
          const profile = userMap.get(userId);
          return {
            user_id: userId,
            full_name: profile?.full_name || "Unknown",
            avatar_url: profile?.avatar_url || null,
            email: profile?.email || "unknown@email.com",
          };
        });

      setTeammates(teammatesData);

      const initialReviews: Record<string, Review> = {};
      teammatesData.forEach((t: Teammate) => {
        initialReviews[t.user_id] = {
          reviewee_id: t.user_id,
          rating: 0,
          feedback: "",
        };
      });
      setReviews(initialReviews);

      const { data: existingReviews } = await supabase
        .from("affirmation_cube")
        .select("reviewee_id")
        .eq("event_id", eventId)
        .eq("reviewer_id", user.id);

      if (
        existingReviews &&
        existingReviews.length === teammatesData.length
      ) {
        setCompleted(true);
      }

      setPageLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast('error', 'Failed to load event data');
      setPageLoading(false);
    }
  };

  const setRating = (userId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], rating },
    }));
  };

  const setFeedback = (userId: string, feedback: string) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], feedback },
    }));
  };

  const handleNext = () => {
    if (currentIndex < teammates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !eventId) return;

    const invalidReviews = Object.values(reviews).filter((r) => r.rating === 0);
    if (invalidReviews.length > 0) {
      showToast('warning', 'Please rate all teammates before submitting!');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No auth token');
      }

      const response = await fetch('/api/affirmation-cube/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          reviews: Object.values(reviews),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submit failed');
      }

      setCompleted(true);
      showToast('success', 'Reviews submitted! 🎉');

      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast('error', `Failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Skeleton loading
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <SkeletonHeader />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Invalid access
  if (!user || !eventId) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-8 text-center border border-gray-200 dark:border-[#3d4459] max-w-md">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Invalid access. Please try again.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#FB6F7A] text-white px-6 py-2 rounded-lg hover:bg-[#F47A49] transition-all font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (completed) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce border-4 border-green-200 dark:border-green-800">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-[#3F3E3D] dark:text-white mb-4">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Your reviews have been submitted successfully.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Your networking score and teammates&apos; scores will be updated shortly.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-[#FB6F7A] to-[#F47A49] text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No teammates
  if (teammates.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#242837] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#2d3548] rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-[#3d4459] max-w-md">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#3F3E3D] dark:text-white mb-2">No Teammates</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No teammates to review for this event.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#FB6F7A] text-white px-6 py-2 rounded-lg hover:bg-[#F47A49] transition-all font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentTeammate = teammates[currentIndex];
  const currentReview = reviews[currentTeammate.user_id];

  return (
    <div className="min-h-screen bg-white dark:bg-[#242837] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#2d3548] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-[#3d4459]">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-[#FB6F7A] dark:hover:text-[#FB6F7A] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3F3E3D] dark:text-white">Affirmation Cube</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rate your teammates from {event?.title}
              </p>
            </div>
          </div>
          <div className="bg-gray-200 dark:bg-[#3d4459] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FB6F7A] to-[#F47A49] h-2 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / teammates.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
            {currentIndex + 1} of {teammates.length} teammates
          </p>
        </div>

        {/* Teammate Card */}
        <div className="bg-white dark:bg-[#2d3548] rounded-2xl shadow-md p-8 mb-6 border border-gray-200 dark:border-[#3d4459]">
          <div className="text-center mb-8">
            {currentTeammate.avatar_url ? (
              <img
                src={currentTeammate.avatar_url}
                alt={currentTeammate.full_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 dark:border-[#3d4459] object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 dark:border-[#3d4459] bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {currentTeammate.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#3F3E3D] dark:text-white mb-1">
              {currentTeammate.full_name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentTeammate.email}
            </p>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-center text-[#3F3E3D] dark:text-gray-300 font-semibold mb-3">
              How would you rate this player?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(currentTeammate.user_id, star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= currentReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {currentReview.rating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                {currentReview.rating === 5 && "Outstanding! ⭐⭐⭐⭐⭐"}
                {currentReview.rating === 4 && "Great player! ⭐⭐⭐⭐"}
                {currentReview.rating === 3 && "Good ⭐⭐⭐"}
                {currentReview.rating === 2 && "Okay ⭐⭐"}
                {currentReview.rating === 1 && "Needs improvement ⭐"}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <label className="block text-[#3F3E3D] dark:text-gray-300 font-semibold mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={currentReview.feedback}
              onChange={(e) => setFeedback(currentTeammate.user_id, e.target.value)}
              placeholder="Share your thoughts about this player..."
              className="w-full p-4 border border-gray-300 dark:border-[#3d4459] dark:bg-[#242837] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB6F7A] resize-none"
              rows={4}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-[#3d4459] text-[#3F3E3D] dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-[#4d5469] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {currentIndex < teammates.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={currentReview.rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FB6F7A] to-[#F47A49] text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || currentReview.rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#21C36E] to-[#15b392] text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit All Reviews
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-[#2d3548] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-[#3d4459]">
          <h3 className="font-bold text-[#3F3E3D] dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Review Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {teammates.map((teammate, idx) => {
              const review = reviews[teammate.user_id];
              const isReviewed = review.rating > 0;
              return (
                <div
                  key={teammate.user_id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    idx === currentIndex
                      ? "border-[#FB6F7A] bg-[#FFF5F6] dark:bg-[#3d2d2e]"
                      : isReviewed
                      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-[#3d4459] bg-[#F4F4EF] dark:bg-[#3d4459]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {teammate.avatar_url ? (
                      <img
                        src={teammate.avatar_url}
                        alt={teammate.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB6F7A] to-[#F47A49] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {teammate.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isReviewed && (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#3F3E3D] dark:text-gray-300 truncate">
                    {teammate.full_name}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        className={`${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffirmationCubePage;
