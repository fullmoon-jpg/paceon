"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Send, CheckCircle, Trophy, Users, ArrowLeft, Sparkles } from "lucide-react";
import { format } from "date-fns";

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

const AffirmationCubePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const { user, loading } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!loading && user && eventId) {
      fetchEventAndTeammates();
      checkExistingReviews();
    }
  }, [loading, user, eventId]);

  const fetchEventAndTeammates = async () => {
    if (!user || !eventId) return;

    // Fetch event details
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();
    setEvent(eventData);

    // Fetch teammates (exclude current user)
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("user_id, users_profile!inner(full_name, avatar_url, email)")
      .eq("event_id", eventId)
      .eq("booking_status", "attended")
      .neq("user_id", user.id);

    const teammatesData = (bookingsData || []).map((b: any) => ({
      user_id: b.user_id,
      full_name: b.users_profile.full_name,
      avatar_url: b.users_profile.avatar_url,
      email: b.users_profile.email,
    }));

    setTeammates(teammatesData);

    // Initialize reviews state
    const initialReviews: Record<string, Review> = {};
    teammatesData.forEach((t: Teammate) => {
      initialReviews[t.user_id] = { reviewee_id: t.user_id, rating: 0, feedback: "" };
    });
    setReviews(initialReviews);
  };

  const checkExistingReviews = async () => {
    if (!user || !eventId) return;

    const { data } = await supabase
      .from("affirmation_cube")
      .select("reviewee_id")
      .eq("event_id", eventId)
      .eq("reviewer_id", user.id);

    if (data && data.length === teammates.length) {
      setCompleted(true);
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

    // Validate all ratings
    const invalidReviews = Object.values(reviews).filter((r) => r.rating === 0);
    if (invalidReviews.length > 0) {
      alert("Please rate all teammates before submitting!");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare reviews for batch insert
      const reviewsToInsert = Object.values(reviews).map((review) => ({
        event_id: eventId,
        reviewer_id: user.id,
        reviewee_id: review.reviewee_id,
        rating: review.rating,
        feedback: review.feedback || null,
      }));

      const { error } = await supabase.from("affirmation_cube").insert(reviewsToInsert);

      if (error) throw error;

      setCompleted(true);
      
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting reviews:", error);
      alert(`Failed to submit reviews: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#15b392] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid access. Please try again.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#15b392] text-white px-6 py-2 rounded-lg hover:bg-[#129176]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You! 🎉</h2>
          <p className="text-gray-600 mb-2">Your reviews have been submitted successfully.</p>
          <p className="text-sm text-gray-500 mb-6">
            Your networking score and teammates' scores will be updated shortly.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (teammates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No teammates to review for this event.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#15b392] text-white px-6 py-2 rounded-lg hover:bg-[#129176]"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-[#15b392] mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Affirmation Cube</h1>
              <p className="text-sm text-gray-500">Rate your teammates from {event?.title}</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#15b392] to-[#2a6435] h-2 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / teammates.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {currentIndex + 1} of {teammates.length} teammates
          </p>
        </div>

        {/* Teammate Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            {currentTeammate.avatar_url ? (
              <img
                src={currentTeammate.avatar_url}
                alt={currentTeammate.full_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 bg-[#15b392] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {currentTeammate.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentTeammate.full_name}</h2>
            <p className="text-sm text-gray-500">{currentTeammate.email}</p>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-center text-gray-700 font-semibold mb-3">
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
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {currentReview.rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {currentReview.rating === 5 && "Outstanding!"}
                {currentReview.rating === 4 && "Great player!"}
                {currentReview.rating === 3 && "Good"}
                {currentReview.rating === 2 && "Okay"}
                {currentReview.rating === 1 && "Needs improvement"}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={currentReview.feedback}
              onChange={(e) => setFeedback(currentTeammate.user_id, e.target.value)}
              placeholder="Share your thoughts about this player..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15b392] resize-none"
              rows={4}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {currentIndex < teammates.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={currentReview.rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#15b392] to-[#2a6435] text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || currentReview.rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                  className={`p-3 rounded-lg border-2 ${
                    idx === currentIndex
                      ? "border-[#15b392] bg-green-50"
                      : isReviewed
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-gray-50"
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
                      <div className="w-8 h-8 rounded-full bg-[#15b392] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {teammate.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isReviewed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {teammate.full_name}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        className={`${
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
