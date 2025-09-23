"use client"
import React, { useState } from 'react';
import { db } from "@paceon/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, ArrowLeft, Users, CheckCircle, AlertCircle, MessageSquare, Heart } from 'lucide-react';

interface User {
  id: number;
  name: string;
  position: string;
}

interface Feedback {
  userId: number;
  userName: string;
  feedback: string;
}

const AffirmationCube = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState<number>(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const users: User[] = [
    { id: 1, name: "Rayhan Fikri Ramadhandi", position: "CEO Indieworks Creative" },
    { id: 2, name: "Novan Adrian", position: "CTO & Co-founder Qasir" },
    { id: 3, name: "Jessica Manuel Susanto", position: "Founder Office Petzo" },
    { id: 4, name: "Salma Dias Saraswati", position: "CEO & Co-founder Tenang AI" }
  ];

  const getUsersToRate = (selectedUserId: number): User[] => {
    return users.filter(user => user.id !== selectedUserId);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    const usersToRate = getUsersToRate(user.id);
    setFeedbacks(usersToRate.map(u => ({
      userId: u.id,
      userName: u.name,
      feedback: ''
    })));
  };

  const handleFeedbackChange = (feedback: string) => {
    const newFeedbacks = [...feedbacks];
    newFeedbacks[currentFeedbackIndex].feedback = feedback;
    setFeedbacks(newFeedbacks);
  };

  const handleNext = () => {
    if (currentFeedbackIndex < feedbacks.length - 1) {
      setCurrentFeedbackIndex(currentFeedbackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFeedbackIndex > 0) {
      setCurrentFeedbackIndex(currentFeedbackIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || feedbacks.some(f => !f.feedback.trim())) {
      alert('Mohon lengkapi semua feedback!');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "affirmations"), {
        evaluatorId: selectedUser.id,
        evaluatorName: selectedUser.name,
        feedbacks: feedbacks,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });
      
      setIsCompleted(true);
      setTimeout(() => {
        resetForm();
      }, 4000);
    } catch (error) {
      console.error("Error saving affirmation:", error);
      alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setCurrentFeedbackIndex(0);
    setFeedbacks([]);
    setIsCompleted(false);
  };

  const currentFeedback = feedbacks[currentFeedbackIndex];
  const isCurrentComplete = currentFeedback && currentFeedback.feedback.trim();
  const allComplete = feedbacks.every(f => f.feedback.trim());

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Terima Kasih!
            </h2>
            <p className="text-gray-600 mb-4">
              Feedback Anda telah berhasil disimpan dan sangat berharga untuk pengembangan komunitas PACE.ON.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Mengarahkan kembali...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2a6435] text-center">
                AFFIRMATION CUBE
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-4xl font-open-sans font-bold mx-auto px-4 sm:px-0">
              Berikan afirmasi positif untuk rekan-rekan komunitas Anda di PACE.ON
            </p>
          </div>

          {/* User Selection Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#352a64]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pilih Identitas Anda</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-[#2a6435] hover:bg-green-50 transition-all group"
                  >
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#2a6435] text-base sm:text-lg">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-600 font-open-sans group-hover:text-[#2a6435] font-semibold">
                        {user.position}
                      </span>
                    </div>
                    <div className="text-[#2a6435] opacity-0 group-hover:opacity-100 transition-opacity text-lg sm:text-xl">
                      →
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-purple-800 mb-1">Panduan Affirmation</p>
                    <p className="text-purple-700 leading-relaxed">
                      Berikan feedback yang jujur dan konstruktif untuk membantu rekan komunitas 
                      berkembang dan membangun hubungan yang lebih baik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#15b392] via-[#2a6435] to-[#15b392] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a6435] text-center">
              AFFIRMATION CUBE
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl font-open-sans font-bold mx-auto px-4 sm:px-0">
            Memberikan afirmasi sebagai <span className="text-[#2a6435] font-bold">{selectedUser.name}</span>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="flex items-center space-x-1 sm:space-x-2 max-w-full">
            {feedbacks.map((_, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all
                  ${index === currentFeedbackIndex 
                    ? 'bg-[#2a6435] text-white scale-110 shadow-lg' 
                    : index < currentFeedbackIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index < currentFeedbackIndex ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < feedbacks.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                    index < currentFeedbackIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {currentFeedback && (
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Afirmasi untuk {currentFeedback.userName}
                </h2>
                <div className="text-xs sm:text-sm text-gray-700 sm:ml-auto">
                  {currentFeedbackIndex + 1} dari {feedbacks.length}
                </div>
              </div>

              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#15b392] to-[#2a6435] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl mb-3 mx-auto">
                  {currentFeedback.userName.split(' ').map(name => name.charAt(0)).join('').slice(0, 2)}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                  {currentFeedback.userName}
                </h3>
                <p className="text-sm text-gray-600 mb-3 font-open-sans font-bold">
                  {users.find(u => u.id === currentFeedback.userId)?.position}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm font-open-sans font-bold">
                  Berikan feedback yang konstruktif dan membangun
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kesan & Pesan *
                </label>
                <textarea
                  value={currentFeedback.feedback}
                  onChange={(e) => handleFeedbackChange(e.target.value)}
                  placeholder={`Tuliskan kesan dan pesan positif Anda untuk ${currentFeedback.userName}...`}
                  className="w-full text-black p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-[#2a6435] focus:outline-none transition-colors text-sm sm:text-base"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 font-open-sans font-bold">
                  Berikan feedback yang membangun dan positif untuk mendukung perkembangan rekan komunitas
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium text-blue-800 mb-1">Tips Affirmation</p>
                    <p className="text-blue-700 leading-relaxed">
                      Fokus pada aspek positif yang dapat dikembangkan dan berikan saran konstruktif 
                      yang dapat membantu rekan komunitas tumbuh lebih baik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => currentFeedbackIndex === 0 ? resetForm() : handlePrevious()}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                  {currentFeedbackIndex === 0 ? 'Kembali' : 'Sebelumnya'}
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {currentFeedbackIndex < feedbacks.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!isCurrentComplete}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
                      isCurrentComplete
                        ? 'bg-[#2a6435] text-white hover:bg-green-950 focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Lanjut
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4 rotate-180" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allComplete || isSubmitting}
                    className={`flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto justify-center ${
                      allComplete && !isSubmitting
                        ? 'bg-gradient-to-br from-[#15b392] via-[#2a6435] to-[#15b392] text-white hover:from-[#2a6435] hover:via-[#15b392] hover:to-[#2a6435] focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="sm:w-5 sm:h-5" />
                        Kirim Affirmation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-black font-open-sans font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <AlertCircle size={14} className="sm:w-4 sm:h-4" />
            <span>Semua affirmation akan dijaga kerahasiaannya dan digunakan untuk pengembangan komunitas</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffirmationCube;