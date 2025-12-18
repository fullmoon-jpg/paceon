"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

interface FormData {
  full_name: string;
  company: string;
  role: string;
  gathering_frequency: string;
  gathering_frequency_other: string;
  conversation_type: string;
  casual_medium: string;
  casual_medium_other: string;
  serious_format: string[];
  serious_format_other: string;
  preferred_locations: string[];
  current_needs: string;
  gathering_topic: string;
  gathering_topic_other: string;
  small_group_interest: string;
  community_expectations: string;
  price_community_gathering: string;
  price_sports_activity: string;
  price_fgd: string;
  podcast_interest: string;
  founder_content_interest: string;
  project_openness: string;
  company_logo: File | null;
}

const CommunitySensingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    company: '',
    role: '',
    gathering_frequency: '',
    gathering_frequency_other: '',
    conversation_type: '',
    casual_medium: '',
    casual_medium_other: '',
    serious_format: [],
    serious_format_other: '',
    preferred_locations: [],
    current_needs: '',
    gathering_topic: '',
    gathering_topic_other: '',
    small_group_interest: '',
    community_expectations: '',
    price_community_gathering: '',
    price_sports_activity: '',
    price_fgd: '',
    podcast_interest: '',
    founder_content_interest: '',
    project_openness: '',
    company_logo: null,
  });

  const gatheringFrequencyOptions = [
    "1 bulan sekali",
    "1 bulan 2 kali",
    "2 bulan sekali",
    "Lainnya"
  ];

  const conversationTypeOptions = [
    "Sharing & diskusi bisnis",
    "Obrolan santai / non-formal",
    "Kombinasi keduanya"
  ];

  const casualMediumOptions = [
    "Aktivitas olahraga",
    "Coffee chat / ngobrol bareng",
    "Kombinasi keduanya",
    "Lainnya"
  ];

  const seriousFormatOptions = [
    "FGD (diskusi terarah)",
    "Collaboration / matchmaking",
    "Sharing pengalaman",
    "Lainnya"
  ];

  const locationOptions = [
    "Jakarta Pusat",
    "Jakarta Selatan",
    "Jakarta Timur",
    "Jakarta Barat",
    "Jakarta Utara",
    "Tangerang Selatan",
    "Bekasi",
    "Depok",
    "Bogor"
  ];

  const gatheringTopicOptions = [
    "Community & Ecosystem",
    "Networking",
    "Regulation",
    "Collaboration antar bisnis",
    "Fundamental bisnis",
    "Lainnya"
  ];

  const yesNoMaybeOptions = [
    "Iya",
    "Mungkin",
    "Tidak"
  ];

  const projectOpennessOptions = [
    "Iya",
    "Tergantung projectnya",
    "Tidak"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setError('Format file harus JPG, PNG, atau SVG');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        company_logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      company_logo: null
    }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBorderColor = (value: string): string => {
    if (!showValidation) {
      return 'border-[#3f3e3d]/20 focus:border-[#21C36E]';
    }
    
    return value.trim() !== '' 
      ? 'border-green-500' 
      : 'border-red-500';
  };

  const handleCheckboxChange = (field: 'serious_format' | 'preferred_locations', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      }
      
      return {
        ...prev,
        [field]: [...currentValues, value]
      };
    });
  };

  const isFormValid = () => {
    return (
        formData.full_name.trim() !== '' &&
        formData.company.trim() !== '' &&
        formData.role.trim() !== '' &&
        formData.gathering_frequency.trim() !== '' &&
        formData.conversation_type.trim() !== '' &&
        formData.casual_medium.trim() !== '' &&
        formData.serious_format.length > 0 &&
        formData.preferred_locations.length > 0 &&
        formData.current_needs.trim() !== '' &&
        formData.gathering_topic.trim() !== '' &&
        formData.small_group_interest.trim() !== '' &&
        formData.community_expectations.trim() !== '' &&
        formData.podcast_interest.trim() !== '' &&
        formData.founder_content_interest.trim() !== '' &&
        formData.project_openness.trim() !== '' &&
        formData.company_logo !== null  // ADD THIS LINE
    );
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setShowValidation(true);
    
    if (!isFormValid()) {
      setError('Mohon isi semua pertanyaan yang wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all text fields
      submitData.append('full_name', formData.full_name);
      submitData.append('company', formData.company);
      submitData.append('role', formData.role);
      submitData.append('gathering_frequency', formData.gathering_frequency);
      submitData.append('gathering_frequency_other', formData.gathering_frequency_other);
      submitData.append('conversation_type', formData.conversation_type);
      submitData.append('casual_medium', formData.casual_medium);
      submitData.append('casual_medium_other', formData.casual_medium_other);
      submitData.append('serious_format', JSON.stringify(formData.serious_format));
      submitData.append('serious_format_other', formData.serious_format_other);
      submitData.append('preferred_locations', JSON.stringify(formData.preferred_locations));
      submitData.append('current_needs', formData.current_needs);
      submitData.append('gathering_topic', formData.gathering_topic);
      submitData.append('gathering_topic_other', formData.gathering_topic_other);
      submitData.append('small_group_interest', formData.small_group_interest);
      submitData.append('community_expectations', formData.community_expectations);
      submitData.append('price_community_gathering', formData.price_community_gathering);
      submitData.append('price_sports_activity', formData.price_sports_activity);
      submitData.append('price_fgd', formData.price_fgd);
      submitData.append('podcast_interest', formData.podcast_interest);
      submitData.append('founder_content_interest', formData.founder_content_interest);
      submitData.append('project_openness', formData.project_openness);
      
      // Append file if exists
      if (formData.company_logo) {
        submitData.append('company_logo', formData.company_logo);
      }

      const response = await fetch('/api/community-sensing', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }

      setIsSuccess(true);
      setShowValidation(false);
      setLogoPreview(null);
      
      // Reset form
      setFormData({
        full_name: '',
        company: '',
        role: '',
        gathering_frequency: '',
        gathering_frequency_other: '',
        conversation_type: '',
        casual_medium: '',
        casual_medium_other: '',
        serious_format: [],
        serious_format_other: '',
        preferred_locations: [],
        current_needs: '',
        gathering_topic: '',
        gathering_topic_other: '',
        small_group_interest: '',
        community_expectations: '',
        price_community_gathering: '',
        price_sports_activity: '',
        price_fgd: '',
        podcast_interest: '',
        founder_content_interest: '',
        project_openness: '',
        company_logo: null,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Terjadi kesalahan. Silakan coba lagi.';
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen w-full pt-24 pb-16 bg-[#f4f4ef]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-block mb-6 transform -skew-y-1">
            <div className="bg-[#21C36E] px-10 sm:px-12 md:px-16 py-4 sm:py-5">
              <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white transform skew-y-1">
                COMMUNITY SENSING
              </h1>
            </div>
          </div>
          <p className="font-body text-base sm:text-lg text-[#3f3e3d]/80 max-w-2xl mx-auto leading-relaxed">
            Bantu kami memahami kebutuhan dan preferensi lo untuk membangun komunitas yang lebih baik!
          </p>
        </div>

        {isSuccess ? (
          // Success Message
          <div className="border-2 border-green-200 rounded-3xl p-8 sm:p-10 text-center bg-green-50/30">
            <div className="w-20 h-20 text-green-500 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-brand text-2xl sm:text-3xl text-[#3f3e3d] mb-4">
              Terima Kasih!
            </h2>
            <p className="font-body text-sm sm:text-base text-[#3f3e3d]/80 mb-6 leading-relaxed">
              Respons lo udah berhasil dikirim. Feedback lo sangat berharga untuk perkembangan komunitas PACE ON!
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="bg-[#21C36E] hover:bg-[#1BAA5E] text-white font-brand text-base px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105"
            >
              Isi Lagi
            </button>
          </div>
        ) : (
          // Form
          <form
            onSubmit={handleSubmit}
            className="border-2 border-[#3f3e3d]/10 rounded-3xl p-8 sm:p-10 lg:p-12 bg-white/50 shadow-xl"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              
              {/* 1. Nama */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  1. Nama lo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.full_name)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Nama lengkap lo"
                />
              </div>

              {/* 2. Company */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  2. Company lo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.company)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Nama perusahaan / organisasi"
                />
              </div>

              {/* 3. Role */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  3. Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.role)} font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Posisi / jabatan lo"
                />
              </div>

              {/* 4. Gathering Frequency */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  4. Seberapa sering menurut lo idealnya komunitas ini mengadakan gathering? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {gatheringFrequencyOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="gathering_frequency"
                        value={option}
                        checked={formData.gathering_frequency === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.gathering_frequency === 'Lainnya' && (
                  <input
                    type="text"
                    name="gathering_frequency_other"
                    value={formData.gathering_frequency_other}
                    onChange={handleChange}
                    placeholder="Sebutkan..."
                    className="mt-3 w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                  />
                )}
              </div>

              {/* 5. Conversation Type */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  5. Dalam komunitas ini, lo lebih enjoy obrolan seperti apa? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {conversationTypeOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="conversation_type"
                        value={option}
                        checked={formData.conversation_type === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Casual Medium */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  6. Untuk sesi obrolan santuy, media apa yang paling lo pilih? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {casualMediumOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="casual_medium"
                        value={option}
                        checked={formData.casual_medium === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.casual_medium === 'Lainnya' && (
                  <input
                    type="text"
                    name="casual_medium_other"
                    value={formData.casual_medium_other}
                    onChange={handleChange}
                    placeholder="Sebutkan medium yang lo mau..."
                    className="mt-3 w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                  />
                )}
              </div>

              {/* 7. Serious Format */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  7. Untuk sesi yang membahas bisnis secara lebih serius, format apa yang paling lo suka? <span className="text-red-500">* (Bisa pilih lebih dari satu)</span>
                </label>
                <div className="space-y-3 pl-1">
                  {seriousFormatOptions.map(option => (
                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.serious_format.includes(option)}
                        onChange={() => handleCheckboxChange('serious_format', option)}
                        className="mt-1 w-4 h-4 rounded border-2 border-gray-300 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.serious_format.includes('Lainnya') && (
                  <input
                    type="text"
                    name="serious_format_other"
                    value={formData.serious_format_other}
                    onChange={handleChange}
                    placeholder="Sebutkan format lainnya..."
                    className="mt-3 w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                  />
                )}
              </div>

              {/* 8. Preferred Locations */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  8. Jika ada pertemuan offline, lokasi mana yang paling nyaman buat lo? <span className="text-red-500">* (Bisa pilih lebih dari satu)</span>
                </label>
                <div className="grid grid-cols-2 gap-3 pl-1">
                  {locationOptions.map(option => (
                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.preferred_locations.includes(option)}
                        onChange={() => handleCheckboxChange('preferred_locations', option)}
                        className="mt-1 w-4 h-4 rounded border-2 border-gray-300 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 9. Current Needs */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  9. Apa yang sedang lo cari saat ini, dan hal apa yang lo harapkan bisa dibantu PACE ON, baik secara personal maupun bisnis? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="current_needs"
                  value={formData.current_needs}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.current_needs)} resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Ceritakan kebutuhan dan harapan lo..."
                />
              </div>

              {/* 10. Gathering Topic */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  10. Kalau ada gathering besar dengan satu komunitas, topik apa yang paling bikin lo tertarik? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {gatheringTopicOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="gathering_topic"
                        value={option}
                        checked={formData.gathering_topic === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.gathering_topic === 'Lainnya' && (
                  <input
                    type="text"
                    name="gathering_topic_other"
                    value={formData.gathering_topic_other}
                    onChange={handleChange}
                    placeholder="Sebutkan topik lainnya..."
                    className="mt-3 w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                  />
                )}
              </div>

              {/* 11. Small Group Interest */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  11. Kalau ada small group di dalam komunitas, grup seperti apa yang paling ingin lo ikuti? <span className="text-red-500">*</span>
                  <span className="block text-xs text-[#3f3e3d]/60 mt-1 font-body">Contoh: olahraga, game, industri bisnis, dll</span>
                </label>
                <textarea
                  name="small_group_interest"
                  value={formData.small_group_interest}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.small_group_interest)} resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Ceritakan jenis grup yang lo minati..."
                />
              </div>

              {/* 12. Community Expectations */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  12. Apa harapan dan keinginan utama lo terhadap komunitas ini ke depannya? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="community_expectations"
                  value={formData.community_expectations}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full text-[#3f3e3d] pb-2 border-b-2 ${getBorderColor(formData.community_expectations)} resize-none font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40`}
                  placeholder="Ceritakan harapan lo untuk PACE ON..."
                />
              </div>

              {/* 13. Price Range */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-4">
                  13. Berapa range harga yang menurut lo wajar untuk tiap jenis kegiatan berikut? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-[#3f3e3d]/80 mb-2 block">
                      Community gathering
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm text-[#3f3e3d]">Rp</span>
                      <input
                        type="text"
                        name="price_community_gathering"
                        value={formData.price_community_gathering}
                        onChange={handleChange}
                        placeholder="50000"
                        className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#3f3e3d]/80 mb-2 block">
                      Sports / activity-based gathering
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm text-[#3f3e3d]">Rp</span>
                      <input
                        type="text"
                        name="price_sports_activity"
                        value={formData.price_sports_activity}
                        onChange={handleChange}
                        placeholder="100000"
                        className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-sm text-[#3f3e3d]/80 mb-2 block">
                      FGD / diskusi terarah
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm text-[#3f3e3d]">Rp</span>
                      <input
                        type="text"
                        name="price_fgd"
                        value={formData.price_fgd}
                        onChange={handleChange}
                        placeholder="75000"
                        className="w-full text-[#3f3e3d] pb-2 border-b-2 border-[#3f3e3d]/20 focus:border-[#21C36E] font-body text-base transition-all bg-transparent outline-none placeholder:text-[#3f3e3d]/40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 14. Podcast Interest */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  14. Apakah lo tertarik jika diundang sebagai guest untuk podcast atau konten komunitas? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {yesNoMaybeOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="podcast_interest"
                        value={option}
                        checked={formData.podcast_interest === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 15. Founder Content Interest */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  15. Apakah lo tertarik untuk mengikuti atau masuk ke konten seputar founder journey? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {yesNoMaybeOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="founder_content_interest"
                        value={option}
                        checked={formData.founder_content_interest === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 16. Project Openness */}
              <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                  16. Would you be open klo suatu saat ada project yang dilempar ke lu? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {projectOpennessOptions.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="project_openness"
                        value={option}
                        checked={formData.project_openness === option}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#21C36E] focus:ring-[#21C36E] focus:ring-2 cursor-pointer"
                      />
                      <span className="font-body text-sm text-[#3f3e3d] group-hover:text-[#21C36E] transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 17. Company Logo Upload */}
                <div>
                <label className="font-brand block text-sm text-[#3f3e3d] mb-3">
                    17. Boleh share logo perusahaan lo untuk kebutuhan dokumentasi & kolaborasi komunitas? <span className="text-red-500">*</span>
                </label>
                
                <div className="mt-3">
                    {!logoPreview ? (
                    <div className="relative">
                        <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                        id="company-logo-upload"
                        required  // ADD THIS
                        />
                        <label
                        htmlFor="company-logo-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed ${
                            showValidation && !formData.company_logo 
                            ? 'border-red-500' 
                            : 'border-[#3f3e3d]/30'
                        } rounded-2xl cursor-pointer bg-[#f4f4ef]/30 hover:bg-[#f4f4ef]/60 transition-all duration-300 group`}
                        >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-12 h-12 mb-4 text-[#3f3e3d]/40 group-hover:text-[#21C36E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-[#3f3e3d] font-body">
                            <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                            </p>
                            <p className="text-xs text-[#3f3e3d]/60 font-body">
                            PNG, JPG, atau SVG (Max. 5MB)
                            </p>
                        </div>
                        </label>
                        {showValidation && !formData.company_logo && (
                        <p className="mt-2 text-sm text-red-500 font-body">Logo perusahaan wajib diupload</p>
                        )}
                    </div>
                    ) : (
                    <div className="relative border-2 border-[#21C36E] rounded-2xl p-4 bg-green-50/30">
                        <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-[#3f3e3d]/10">
                            <Image
                            src={logoPreview}
                            alt="Logo preview"
                            fill
                            className="object-contain p-2"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-body text-sm text-[#3f3e3d] font-semibold mb-1">
                            {formData.company_logo?.name}
                            </p>
                            <p className="font-body text-xs text-[#3f3e3d]/60">
                            {formData.company_logo && (formData.company_logo.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                            aria-label="Remove logo"
                        >
                            <svg className="w-5 h-5 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        </div>
                    </div>
                    )}
                </div>
                </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="w-full bg-[#21C36E] hover:bg-[#1BAA5E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-brand text-lg py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 uppercase tracking-wide"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Respons'}
                </button>
              </div>

              <p className="text-center font-body text-xs text-[#3f3e3d]/60 pt-2">
                Terima kasih atas waktu dan feedback lo! 🙏
              </p>
            </div>
          </form>
        )}

      </div>
    </section>
  );
};

export default CommunitySensingPage;