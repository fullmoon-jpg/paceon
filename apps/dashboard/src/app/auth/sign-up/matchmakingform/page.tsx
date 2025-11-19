"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@paceon/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";

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
        // First attempt to get session
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.replace('/auth/login?error=session_error');
          return;
        }

        // Retry mechanism for OAuth redirect race condition
        if (!session?.user) {
          console.log('No session found, retrying once...');
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResult = await supabase.auth.getSession();
          session = retryResult.data.session;
        }

        if (!session?.user) {
          console.error('No session found after retry');
          router.replace('/auth/login?error=no_session');
          return;
        }

        setUserId(session.user.id);

        // Load existing profile data
        const { data: profile, error: profileError } = await supabase
          .from("users_profile")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        if (profile?.full_name) {
          setFormData(prev => ({ ...prev, fullName: profile.full_name }));
        }

        // Check if preferences already exist
        const { data: existingPrefs } = await supabase
          .from("matchmaking_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (existingPrefs) {
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

    const { error: profileError } = await supabase
      .from("users_profile")
      .update({
        full_name: formData.fullName,
      })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

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
      throw matchmakingError;
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    
    setLoading(true);
    try {
      await saveUserData();
      router.replace("/?welcome=true");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error saving profile. Please try again.";
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F4F4EF] dark:bg-[#3F3E3D] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FB6F7A] border-r-[#007AA6] animate-spin"></div>
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center bg-white dark:bg-[#3F3E3D] rounded-full p-4">
              <Image
                src="/images/dark-logo.png"
                alt="PACE ON"
                width={120}
                height={120}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/light-logo.png"
                alt="PACE ON"
                width={120}
                height={120}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>
          
          <p className="mt-6 text-[#3F3E3D] dark:text-white font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const stepConfig = [
    {
      title: "What's your full name?",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
          />
          <p className="text-[#3F3E3D] dark:text-white">Your LinkedIn Profile (Required)</p>
          <input
            type="url"
            value={formData.linkedIn}
            onChange={(e) => handleInputChange("linkedIn", e.target.value)}
            placeholder="Example: linkedin.com/in/yourprofile"
            className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
          />
        </div>
      ),
    },
    {
      title: "Where do you work?",
      content: (
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          placeholder="Company name"
          className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
        />
      ),
    },
    {
      title: "What's your position?",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            placeholder="Your position"
            className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
          />
          <p className="text-[#3F3E3D] dark:text-white">How long have you been in this position?</p>
          <select
            value={formData.positionDuration}
            onChange={(e) => handleInputChange("positionDuration", e.target.value)}
            className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
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
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
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
              className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
            />
          )}
        </div>
      ),
    },
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
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
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
              className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
            />
          )}
        </div>
      ),
    },
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
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What topics are you passionate about? (You can choose more than 1)",
      content: (
        <div className="space-y-3">
          {["Tech & Innovation", "Business & Startups", "Sports & Fitness", "Arts & Culture", "Social Impact"].map((topic) => (
            <button
              key={topic}
              onClick={() => handleMultiSelect("passionateTopics", topic)}
              className={`w-full px-4 py-3 text-left rounded-lg border transition ${
                formData.passionateTopics.includes(topic)
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
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
            className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
          />
        </div>
      ),
    },
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
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
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
              className="w-full px-4 py-3 text-[#3F3E3D] dark:text-white bg-white dark:bg-[#3F3E3D] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB6F7A]"
            />
          )}
        </div>
      ),
    },
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
                  ? "bg-[#FB6F7A] text-white border-[#FB6F7A]"
                  : "bg-white dark:bg-[#3F3E3D] text-[#3F3E3D] dark:text-white border-gray-300 dark:border-gray-600 hover:border-[#FB6F7A]"
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
    <div className="relative min-h-screen bg-[#F4F4EF] dark:bg-[#3F3E3D]">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <h1 
          className="text-xl sm:text-2xl font-brand text-[#FB6F7A]"
          style={{ transform: 'rotate(-3deg)' }}
        >
          PACE ON
        </h1>
      </div>
      
      <main className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white dark:bg-[#3F3E3D] px-4 sm:px-6 lg:px-8 py-8 lg:py-0 z-10">
          <div className="w-full max-w-md space-y-6 lg:space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#FB6F7A] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6 min-h-[300px] sm:min-h-[350px]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3F3E3D] dark:text-white">
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
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-[#F4F4EF] dark:bg-gray-700 text-[#3F3E3D] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid() || loading}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition shadow-lg hover:shadow-xl ${
                    isStepValid() && !loading
                      ? "bg-[#FB6F7A] text-white hover:bg-[#D33181]"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className={`px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition shadow-lg hover:shadow-xl ${
                    isStepValid() && !loading
                      ? "bg-[#21C36E] text-white hover:bg-[#21C36E]/80"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
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
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </main>
    </div>
  );
}