"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../../../../../packages/lib/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function MatchmakingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    position: "",
    positionDuration: "",   // ✅ berapa lama dia jadi founder/pro
    linkedIn: "",           // ✅ LinkedIn URL
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
    photoURL: "",
    role: "user",
  });

  const totalSteps = 9; // ✅ nambah 1 step untuk foto profile

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
          // ✅ Fix: Perbaiki regex LinkedIn - cukup cek domain linkedin.com
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
      case 10: return formData.photoURL.trim().length > 0; // ✅ photo wajib
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const saveUserData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const uid = user.uid;

    const data = {
      uid,
      role: formData.role,
      fullName: formData.fullName,
      linkedIn: formData.linkedIn,   // ✅ simpan link linkedin
      company: formData.company,
      position: formData.position,
      positionDuration: formData.positionDuration,
      location: formData.location === "Other" ? formData.locationOther : formData.location,
      goal: formData.goal === "Other" ? formData.goalOther : formData.goal,
      networkingStyle: formData.networkingStyle,
      passionateTopics: [
        ...formData.passionateTopics,
        ...(formData.passionateOther ? [formData.passionateOther] : []),
      ].filter(Boolean),
      hobby: formData.hobby === "Other" ? formData.hobbyOther : formData.hobby,
      personality: formData.personality,
      photoURL: formData.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", uid), data, { merge: true });
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    try {
      await saveUserData();
      alert("Profile saved & linked to your account! 🎉");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Error saving profile. Please try again.");
    }
  };

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
    {
      title: "Company or Organization",
      content: (
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          placeholder="Enter your company name"
          className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
        />
      ),
    },
    {
      title: "What's your position/role?",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {["Founder", "Professional"].map((role) => (
              <button
                key={role}
                onClick={() => handleInputChange("position", role)}
                className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                  formData.position === role
                    ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                    : "border-gray-300 text-black hover:border-gray-400"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* ✅ Kalau sudah pilih Founder/Professional, munculin input tambahan */}
          {formData.position && (
            <div className="space-y-3">
              <p className="text-black">How many years have you been a {formData.position}?</p>
              <input
                type="number"
                min={0}
                value={formData.positionDuration}
                onChange={(e) => handleInputChange("positionDuration", e.target.value)}
                placeholder={`Enter Number`}
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Where are you located?",
      content: (
        <div className="space-y-3">
          {["Kebayoran Lama Area", "Pasar Minggu Area", "Pesanggrahan Area"].map(
            (location) => (
              <button
                key={location}
                onClick={() => handleInputChange("location", location)}
                className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                  formData.location === location
                    ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                    : "border-gray-300 text-black hover:border-gray-400"
                }`}
              >
                {location}
              </button>
            )
          )}
          <div className="space-y-2">
            <button
              onClick={() => handleInputChange("location", "Other")}
              className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                formData.location === "Other"
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              Other
            </button>
            {formData.location === "Other" && (
              <input
                type="text"
                value={formData.locationOther}
                onChange={(e) =>
                  handleInputChange("locationOther", e.target.value)
                }
                placeholder="Please specify"
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "What's your main goal for joining PACE.ON?",
      content: (
        <div className="space-y-3">
          {["Find potential partners", "Business expansion", "Build social connections"].map(
            (goal) => (
              <button
                key={goal}
                onClick={() => handleInputChange("goal", goal)}
                className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                  formData.goal === goal
                    ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                    : "border-gray-300 text-black hover:border-gray-400"
                }`}
              >
                {goal}
              </button>
            )
          )}
          <div className="space-y-2">
            <button
              onClick={() => handleInputChange("goal", "Other")}
              className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                formData.goal === "Other"
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              Other
            </button>
            {formData.goal === "Other" && (
              <input
                type="text"
                value={formData.goalOther}
                onChange={(e) => handleInputChange("goalOther", e.target.value)}
                placeholder="Please specify"
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "How do you usually prefer networking?",
      content: (
        <div className="space-y-3">
          {["Start casual over activities", "Go straight into business talks"].map(
            (style) => (
              <button
                key={style}
                onClick={() => handleInputChange("networkingStyle", style)}
                className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                  formData.networkingStyle === style
                    ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                    : "border-gray-300 text-black hover:border-gray-400"
                }`}
              >
                {style}
              </button>
            )
          )}
        </div>
      ),
    },
    {
      title: "Topics you're most passionate about:",
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">Select all that apply</p>
          {["Business", "Technology", "Health", "Lifestyle"].map((topic) => (
            <button
              key={topic}
              onClick={() => handleMultiSelect("passionateTopics", topic)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                formData.passionateTopics.includes(topic)
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              {topic}
            </button>
          ))}
          <input
            type="text"
            value={formData.passionateOther}
            onChange={(e) =>
              handleInputChange("passionateOther", e.target.value)
            }
            placeholder="Others (specify)"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
          />
        </div>
      ),
    },
    {
      title: "What's your hobby outside business?",
      content: (
        <div className="space-y-3">
          {["Sport", "Car", "Beauty"].map((hobby) => (
            <button
              key={hobby}
              onClick={() => handleInputChange("hobby", hobby)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                formData.hobby === hobby
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              {hobby}
            </button>
          ))}
          <div className="space-y-2">
            <button
              onClick={() => handleInputChange("hobby", "Other")}
              className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                formData.hobby === "Other"
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              Other
            </button>
            {formData.hobby === "Other" && (
              <input
                type="text"
                value={formData.hobbyOther}
                onChange={(e) => handleInputChange("hobbyOther", e.target.value)}
                placeholder="Please specify"
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15b392]"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "What kind of person are you?",
      content: (
        <div className="space-y-3">
          {[
            "I usually wait for others to start the conversation. I warm up once I feel comfortable.",
            "I can be chatty or quiet depending on the vibe. I adjust to the people around me.",
            "I'm usually the one to break the ice and keep the energy up in the group.",
          ].map((personality) => (
            <button
              key={personality}
              onClick={() => handleInputChange("personality", personality)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition text-sm ${
                formData.personality === personality
                  ? "border-[#15b392] bg-blue-50 text-[#1f4381]"
                  : "border-gray-300 text-black hover:border-gray-400"
              }`}
            >
              {personality}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <h1 className="text-xl sm:text-2xl font-brand font-bold bg-clip-text bg-transparent text-transparent bg-gradient-to-r from-[#15b392] to-[#2a6435]">PACE.ON</h1>
      </div>
      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-4 sm:px-6 lg:px-8 py-8 lg:py-0 z-10">
          <div className="w-full max-w-md space-y-6 lg:space-y-8">
            {/* Progress */}
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

            {/* Form */}
            <div className="space-y-4 lg:space-y-6 min-h-[300px] sm:min-h-[350px]">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {stepConfig[currentStep - 1].title}
              </h2>
              {stepConfig[currentStep - 1].content}
            </div>

            {/* Nav Buttons */}
            <div className="flex justify-between gap-3 sm:gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                  currentStep === 1
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
                  disabled={!isStepValid()}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                    isStepValid()
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
                  disabled={!isStepValid()}
                  className={`px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition ${
                    isStepValid()
                      ? "bg-[#1f4381] text-white hover:bg-blue-950"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Right Section Background Only */}
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