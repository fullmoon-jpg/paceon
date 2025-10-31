"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function MatchmakingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    position: "",
    positionDuration: "",
    linkedIn: "",
    location: "",
    locationOther: "",
    goal: "",
    goalOther: "",
    networkingStyle: "",
    passionateTopics: [] as string[],
    passionateOther: "",
    hobby: "",
    hobbyOther: "",
    personality: "",
  });

  const totalSteps = 9;

  useEffect(() => {
    const initializeForm = async () => {
      try {
        console.log('Initializing matchmaking form...');
        
        // FIX: Use getSession instead of getUser untuk avoid race condition
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.replace('/auth/login?error=session_error');
          return;
        }

        if (!session?.user) {
          console.error('No session found in matchmaking form');
          // CRITICAL: Use replace, NOT push to prevent back button loop
          router.replace('/auth/login?error=no_session');
          return;
        }

        console.log('Session found:', session.user.email);
        setUserId(session.user.id);

        // Load existing profile data
        const { data: profile, error: profileError } = await supabase
          .from("users_profile")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          // Continue anyway, user can still fill the form
        }

        if (profile?.full_name) {
          console.log('ℹPre-filling name from profile');
          setFormData(prev => ({ ...prev, fullName: profile.full_name }));
        }

        // NEW: Check if preferences already exist
        const { data: existingPrefs } = await supabase
          .from("matchmaking_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (existingPrefs) {
          console.log('ℹLoading existing preferences');
          setFormData({
            fullName: profile?.full_name || "",
            company: existingPrefs.company || "",
            position: existingPrefs.position || "",
            positionDuration: existingPrefs.position_duration?.toString() || "",
            linkedIn: existingPrefs.linkedin_url || "",
            location: existingPrefs.location || "",
            locationOther: "",
            goal: existingPrefs.goal || "",
            goalOther: "",
            networkingStyle: existingPrefs.networking_style || "",
            passionateTopics: existingPrefs.passionate_topics || [],
            passionateOther: "",
            hobby: existingPrefs.hobby || "",
            hobbyOther: "",
            personality: existingPrefs.personality || "",
          });
        }

        setInitializing(false);

      } catch (error) {
        console.error('Initialization failed:', error);
        router.replace('/auth/login?error=init_failed');
      }
    };

    initializeForm();
  }, [router]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const selected = prev[field] as string[];
      return {
        ...prev,
        [field]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName.trim().length > 0 &&
          formData.linkedIn.trim().length > 0 &&
          /linkedin\.com\//i.test(formData.linkedIn)
        );
      case 2: return formData.company.trim().length > 0;
      case 3:
        return (
          formData.position.trim().length > 0 &&
          formData.positionDuration.trim().length > 0
        );
      case 4: return formData.location.trim().length > 0 || formData.locationOther.trim().length > 0;
      case 5: return formData.goal.trim().length > 0 || formData.goalOther.trim().length > 0;
      case 6: return formData.networkingStyle.trim().length > 0;
      case 7: return formData.passionateTopics.length > 0 || formData.passionateOther.trim().length > 0;
      case 8: return formData.hobby.trim().length > 0 || formData.hobbyOther.trim().length > 0;
      case 9: return formData.personality.trim().length > 0;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const saveUserData = async () => {
    if (!userId) throw new Error("User not logged in");

    console.log('Saving user data...');

    // Update profile
    const { error: profileError } = await supabase
      .from("users_profile")
      .update({
        full_name: formData.fullName,
      })
      .eq("id", userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    // Save matchmaking preferences
    const matchmakingData = {
      user_id: userId,
      company: formData.company,
      position: formData.position,
      position_duration: parseInt(formData.positionDuration) || null,
      linkedin_url: formData.linkedIn,
      location: formData.location === "Other" ? formData.locationOther : formData.location,
      goal: formData.goal === "Other" ? formData.goalOther : formData.goal,
      networking_style: formData.networkingStyle,
      passionate_topics: [
        ...formData.passionateTopics,
        ...(formData.passionateOther ? [formData.passionateOther] : []),
      ].filter(Boolean),
      hobby: formData.hobby === "Other" ? formData.hobbyOther : formData.hobby,
      personality: formData.personality,
      completed_at: new Date().toISOString(),
    };

    const { error: matchmakingError } = await supabase
      .from("matchmaking_preferences")
      .upsert(matchmakingData, { onConflict: "user_id" });

    if (matchmakingError) {
      console.error('Matchmaking save error:', matchmakingError);
      throw matchmakingError;
    }

    console.log('Data saved successfully');
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    
    setLoading(true);
    try {
      await saveUserData();
      
      // CRITICAL: Use replace to prevent back button issues
      router.replace("/?welcome=true");
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      showToast('error', error.message || "Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔧 NEW: Loading state while checking auth
  if (initializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2a6435] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const stepConfig = [
    // Step 1
    {
      title: "What's your full name?",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          />
          <p className="text-black">Your LinkedIn Profile (Required)</p>
          <input
            type="url"
            value={formData.linkedIn}
            onChange={(e) => handleInputChange("linkedIn", e.target.value)}
            placeholder="Example: linkedin.com/in/yourprofile"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          />
        </div>
      ),
    },
    // Step 2
    {
      title: "Where do you work?",
      content: (
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          placeholder="Company name"
          className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
        />
      ),
    },
    // Step 3
    {
      title: "What's your position?",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            placeholder="Your position"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          />
          <p className="text-black">How long have you been in this position?</p>
          <select
            value={formData.positionDuration}
            onChange={(e) => handleInputChange("positionDuration", e.target.value)}
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          >
            <option value="">Select duration</option>
            <option value="1">Less than 1 year</option>
            <option value="2">1-2 years</option>
            <option value="3">2-3 years</option>
            <option value="4">3-5 years</option>
            <option value="5">More than 5 years</option>
          </select>
        </div>
      ),
    },
    // Step 4
    {
      title: "Where are you based?",
      content: (
        <div className="space-y-3">
          {["Jakarta", "Bandung", "Surabaya", "Bali", "Other"].map((loc) => (
            <button
              key={loc}
              onClick={() => handleInputChange("location", loc)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.location === loc
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {loc}
            </button>
          ))}
          {formData.location === "Other" && (
            <input
              type="text"
              value={formData.locationOther}
              onChange={(e) => handleInputChange("locationOther", e.target.value)}
              placeholder="Please specify"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
            />
          )}
        </div>
      ),
    },
    // Step 5
    {
      title: "What's your main goal?",
      content: (
        <div className="space-y-3">
          {["Professional Growth", "Find Co-founder", "Make Friends", "Other"].map((g) => (
            <button
              key={g}
              onClick={() => handleInputChange("goal", g)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.goal === g
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {g}
            </button>
          ))}
          {formData.goal === "Other" && (
            <input
              type="text"
              value={formData.goalOther}
              onChange={(e) => handleInputChange("goalOther", e.target.value)}
              placeholder="Please specify"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
            />
          )}
        </div>
      ),
    },
    // Step 6
    {
      title: "How do you prefer to network?",
      content: (
        <div className="space-y-3">
          {["Small Groups", "One-on-One", "Large Events", "Online First"].map((style) => (
            <button
              key={style}
              onClick={() => handleInputChange("networkingStyle", style)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.networkingStyle === style
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      ),
    },
    // Step 7
    {
      title: "What topics are you passionate about?",
      content: (
        <div className="space-y-3">
          {["Tech & Innovation", "Business & Startups", "Sports & Fitness", "Arts & Culture", "Social Impact"].map((topic) => (
            <button
              key={topic}
              onClick={() => handleMultiSelect("passionateTopics", topic)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.passionateTopics.includes(topic)
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {topic}
            </button>
          ))}
          <input
            type="text"
            value={formData.passionateOther}
            onChange={(e) => handleInputChange("passionateOther", e.target.value)}
            placeholder="Other topics (optional)"
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          />
        </div>
      ),
    },
    // Step 8
    {
      title: "What's your favorite hobby?",
      content: (
        <div className="space-y-3">
          {["Sports", "Reading", "Gaming", "Travel", "Music", "Other"].map((h) => (
            <button
              key={h}
              onClick={() => handleInputChange("hobby", h)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.hobby === h
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {h}
            </button>
          ))}
          {formData.hobby === "Other" && (
            <input
              type="text"
              value={formData.hobbyOther}
              onChange={(e) => handleInputChange("hobbyOther", e.target.value)}
              placeholder="Please specify"
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
            />
          )}
        </div>
      ),
    },
    // Step 9
    {
      title: "How would you describe yourself?",
      content: (
        <div className="space-y-3">
          {["I usually wait for others to start the conversation. I warm up once I feel comfortable.", "I can be chatty or quiet depending on the vibe. I adjust to the people around me.", "I'm usually the one to break the ice and keep the energy up in the group."].map((p) => (
            <button
              key={p}
              onClick={() => handleInputChange("personality", p)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.personality === p
                  ? "bg-[#15b392] text-white border-[#15b392]"
                  : "bg-white text-black border-gray-300 hover:border-[#15b392]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <h1 className="text-xl sm:text-2xl font-brand font-bold bg-clip-text bg-transparent text-transparent bg-gradient-to-r from-[#15b392] to-[#2a6435]">
          PACE.ON
        </h1>
      </div>
      
      <main className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-4 sm:px-6 lg:px-8 py-8 lg:py-0 z-10">
          <div className="w-full max-w-md space-y-6 lg:space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#2a6435] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6 min-h-[300px] sm:min-h-[350px]">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {stepConfig[currentStep - 1].title}
              </h2>
              {stepConfig[currentStep - 1].content}
            </div>

            <div className="flex justify-between gap-3 sm:gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                  currentStep === 1 || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid() || loading}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                    isStepValid() && !loading
                      ? "bg-[#2a6435] text-white hover:bg-green-950"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className={`px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                    isStepValid() && !loading
                      ? "bg-[#1f4381] text-white hover:bg-blue-950"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Saving..." : "Complete"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className="relative w-full lg:w-1/2 h-48 sm:h-64 lg:h-screen bg-cover bg-center order-first lg:order-last"
          style={{ backgroundImage: `url(/images/matchmaking-image.webp)` }}
        >
          <div className="absolute inset-0 bg-opacity-40"></div>
        </div>
      </main>
    </div>
  );
}