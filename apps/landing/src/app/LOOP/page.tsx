"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Star, Zap, MapPin, Calendar, 
  Sparkles, CheckCircle2, Asterisk, Upload, CreditCard, Instagram,
  Coffee, UtensilsCrossed, Award, Phone
} from 'lucide-react';
import Footer from '../ui/footer';
import { Analytics } from "@vercel/analytics/next";

// --- Types ---
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  currentRole: string;
  instagram: string;
  hearFrom: string;
  reason: string;
  foodChoice: string;     
  drinkChoice: string;     
  paymentProof: File | null;
}

const HEAR_FROM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'teman', label: 'Teman/Kenalan' },
  { value: 'whatsapp', label: 'WhatsApp Group' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'event_sebelumnya', label: 'Event PACE ON Sebelumnya' },
  { value: 'lainnya', label: 'Lainnya' },
];

const FOOD_OPTIONS = [
  { value: 'beef_sandwich', label: 'Beef Savory Sandwich' },
];

const DRINK_OPTIONS = [
  { value: 'latte', label: 'Latte' },
];

// --- Components ---

// 1. Marquee Text
const Marquee = ({ text, direction = 'left', color = 'bg-black text-white' }: { text: string, direction?: 'left' | 'right', color?: string }) => {
  return (
    <div className={`relative flex overflow-hidden py-3 border-y-4 border-black ${color} rotate-[-1deg] my-8 z-10`}>
      <div className={`animate-marquee whitespace-nowrap flex gap-8 font-black text-2xl uppercase tracking-tighter ${direction === 'right' ? 'animate-marquee-reverse' : ''}`}>
        {Array(10).fill(text).map((t, i) => (
          <span key={i} className="flex items-center gap-4">
            {t} <Star className="fill-current" size={20} />
          </span>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 20s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

// 2. Brutalist Button
const BrutalButton = ({ text, onClick, type = 'button', className = '', disabled = false }: { text: string, onClick?: () => void, type?: "button" | "submit", className?: string, disabled?: boolean }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative group font-black text-lg uppercase tracking-wider px-8 py-4 border-4 border-black 
      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 
      transition-all duration-200 flex items-center justify-center gap-2 ${className}
      ${disabled ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-[#fbd249] text-black'}
    `}
  >
    {text}
    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
  </button>
);


export default function LoopGenZPage() {
  const [formData, setFormData] = useState<FormData>({ 
    fullName: '', 
    email: '', 
    phone: '', 
    institution: '',
    currentRole: '',
    instagram: '',
    hearFrom: '',
    reason: '',
    foodChoice: '',
    drinkChoice: '',
    paymentProof: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple animations on mount
  useEffect(() => {
    const elements = document.querySelectorAll('.hero-text, .reveal-up');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('opacity-100', 'translate-y-0');
      }, index * 100);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Tolong upload file gambar yang valid (JPG, PNG, atau WebP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setFormData({ ...formData, paymentProof: file });
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.institution.trim() !== '' &&
      formData.currentRole.trim() !== '' &&
      formData.instagram.trim() !== '' &&
      formData.hearFrom.trim() !== '' &&
      formData.reason.trim() !== '' &&
      formData.foodChoice.trim() !== '' &&
      formData.drinkChoice.trim() !== '' &&
      formData.paymentProof !== null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Tolong isi semua field, pilih makanan & minuman, dan upload bukti pembayaran!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('institution', formData.institution);
      submitData.append('currentRole', formData.currentRole);
      submitData.append('instagram', formData.instagram);
      submitData.append('hearFrom', formData.hearFrom);
      submitData.append('reason', formData.reason);
      submitData.append('foodChoice', formData.foodChoice);
      submitData.append('drinkChoice', formData.drinkChoice);
      if (formData.paymentProof) {
        submitData.append('paymentProof', formData.paymentProof);
      }

      const response = await fetch('/api/loop-registration', {
        method: 'POST',
        body: submitData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mendaftar. Coba lagi ya!');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi ya!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f0f2eb] text-black overflow-x-hidden selection:bg-[#d23a7d] selection:text-white font-sans">
      <Analytics />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <section className="relative pt-16 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-28 border-b-4 border-black bg-[#f0f2eb]">
        <div className="relative">
          <div className="absolute top-0 right-4 md:right-10 rotate-12 animate-pulse scale-75 md:scale-100">
             <div className="bg-[#d23a7d] text-white font-black p-3 md:p-4 rounded-full border-3 md:border-4 border-black shadow-[3px_3px_0px_black] md:shadow-[4px_4px_0px_black] text-xs md:text-base">
                GEN-Z ONLY
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 hero-text opacity-0 translate-y-4 transition-all duration-500">
              <div className="h-4 w-4 bg-black rounded-full"></div>
              <p className="font-bold tracking-widest uppercase text-sm md:text-base">Pace On Presents</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <h1 className="text-[18vw] md:text-[14vw] leading-[0.85] font-black tracking-tighter uppercase hero-text opacity-0 translate-y-4 transition-all duration-500 mix-blend-darken text-[#ef6d77]">
                LOOP <span className="text-transparent stroke-black stroke-2" style={{ WebkitTextStroke: '2px black' }}>SERIES</span>
              </h1>
              <div className="hero-text opacity-0 translate-y-4 transition-all duration-500 bg-[#37c35f] text-white font-black px-3 py-2 md:px-4 md:py-2 border-3 md:border-4 border-black shadow-[4px_4px_0px_black] rotate-[-2deg] text-xs md:text-sm uppercase flex items-center gap-2">
                <Award size={16} className="md:w-5 md:h-5" />
                Beginner Friendly
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 md:mt-8 gap-6 md:gap-8">
              <div className="max-w-3xl hero-text opacity-0 translate-y-4 transition-all duration-500">
                <p className="text-lg md:text-3xl font-bold leading-tight border-l-4 md:border-l-8 border-[#37c35f] pl-4 md:pl-6">
                  Takut salah pas bikin konten? <br/>
                  itu normal<br/>
                  <span className="bg-[#d23a7d] text-white px-2 py-1 text-xl md:text-4xl">LOOP itu hands-on lab, bukan kelas teori.</span><br/>
                  Circle kecil. Real Case <br/>
                  langsung dari  <span className="bg-[#d23a7d] text-white px-2 py-1 text-xl md:text-4xl">FOUNDER & PRACTITIONERS</span>
                </p>
              </div>
              <div className="hero-text opacity-0 translate-y-4 transition-all duration-500 w-full md:w-auto">
                <BrutalButton text="SCROLL BUAT DAFTAR" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full md:w-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee text="SLOT TERBATAS // NO JUDGING, JUST PRACTICE //" />

      <section className="px-4 sm:px-6 lg:px-28 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* KOLOM KIRI - POSTER */}
          <div className="lg:col-span-3 h-fit lg:sticky lg:top-10">
            <div ref={posterRef} className="reveal-up opacity-0 translate-y-8 transition-all duration-500 group relative w-full aspect-[4/5] border-4 border-black overflow-hidden shadow-[8px_8px_0px_black] bg-black">
              
              <img 
                src="/images/Poster_LOOP.png" 
                alt="Event Poster" 
                className="poster-image w-full h-full"
              />
            </div>
          </div>

          {/* KOLOM TENGAH - FORM */}
          <div className="lg:col-span-5">
            <div ref={formRef} className="reveal-up opacity-0 translate-y-8 transition-all duration-500 relative bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black]">
               <div className="mb-6">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Gabung ke Loop</h2>
                 <p className="font-bold text-sm text-gray-500">Buat isi formnya lu bisa tranfer dulu lalu upload buktinya ya chat!!</p>
               </div>

               {isSubmitted ? (
                 <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center animate-fade-in-up">
                   <div className="bg-[#fbd249] p-4 md:p-6 rounded-full border-3 md:border-4 border-black mb-4 md:mb-6">
                     <Sparkles size={36} className="md:w-12 md:h-12" />
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black uppercase mb-3 md:mb-4">Registrasi Berhasil!</h3>
                   <p className="font-bold text-base md:text-lg max-w-md mb-2 px-4">Kami akan verifikasi pembayaran lo dan kirim konfirmasi ke email dalam 24 jam.</p>
                   <p className="text-sm text-gray-600">Sampai ketemu chat! 🎉</p>
                   <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ fullName: '', email: '', phone: '', institution: '', currentRole: '', instagram: '', hearFrom: '', reason: '', foodChoice: '', drinkChoice: '', paymentProof: null });
                      setPreviewUrl(null);
                    }}
                    className="mt-6 md:mt-8 font-bold underline hover:text-[#d23a7d] text-sm md:text-base"
                   >
                     Daftarkan orang lain
                   </button>
                 </div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-100 border-4 border-red-500 p-3 rounded">
                        <p className="font-bold text-red-700 text-xs">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-black uppercase text-xs">Nama Lengkap *</label>
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                          placeholder="NAMA LENGKAP LO"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-black uppercase text-xs">No HP (WhatsApp) *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                          placeholder="0812..."
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-black uppercase text-xs">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                        placeholder="email@kamu.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-black uppercase text-xs">Institusi / Perusahaan *</label>
                      <input 
                        type="text" 
                        name="institution"
                        required
                        className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                        placeholder="SEKOLAH / KAMPUS / PERUSAHAAN"
                        value={formData.institution}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-black uppercase text-xs">Status Sekarang *</label>
                        <div className="relative">
                          <select 
                            name="currentRole"
                            required
                            className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm appearance-none focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all"
                            value={formData.currentRole}
                            onChange={handleInputChange}
                          >
                            <option value="" disabled>PILIH STATUS LO</option>
                            <option value="student_hs">Pelajar SMA</option>
                            <option value="student_uni">Mahasiswa</option>
                            <option value="professional">Fresh Graduate/Profesional</option>
                            <option value="founder">Founder / Entrepreneur</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Zap className="fill-black" size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-black uppercase text-xs flex items-center gap-2">
                          <Instagram size={14} /> Akun Instagram *
                        </label>
                        <input 
                          type="text" 
                          name="instagram"
                          required
                          className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                          placeholder="@username"
                          value={formData.instagram}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-black uppercase text-xs">Tau LOOP dari mana? *</label>
                      <div className="relative">
                        <select 
                          name="hearFrom"
                          required
                          className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm appearance-none focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all"
                          value={formData.hearFrom}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>PILIH SUMBER INFO</option>
                          {HEAR_FROM_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Zap className="fill-black" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-black uppercase text-xs">Kenapa pengen ikut LOOP? *</label>
                      <textarea 
                        name="reason"
                        required
                        rows={3}
                        className="w-full bg-[#f0f2eb] border-3 border-black p-3 font-bold text-sm resize-none focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all placeholder:text-gray-400"
                        placeholder="Ceritain alasan lo pengen join LOOP Series..."
                        value={formData.reason}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Food & Drink Selection */}
                    <div className="bg-[#37c35f]/10 border-3 border-[#37c35f] p-4 rounded space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed size={18} className="text-[#37c35f]" />
                        <h3 className="font-black uppercase text-sm">Pilihan Makanan & Minuman</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="font-black uppercase text-xs flex items-center gap-2">
                            <UtensilsCrossed size={12} /> Pilih Makanan *
                          </label>
                          <div className="relative">
                            <select 
                              name="foodChoice"
                              required
                              className="w-full bg-white border-3 border-black p-2.5 font-bold text-xs appearance-none focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all"
                              value={formData.foodChoice}
                              onChange={handleInputChange}
                            >
                              <option value="" disabled>PILIH MENU MAKANAN</option>
                              {FOOD_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <UtensilsCrossed className="fill-black" size={16} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="font-black uppercase text-xs flex items-center gap-2">
                            <Coffee size={12} /> Pilih Minuman *
                          </label>
                          <div className="relative">
                            <select 
                              name="drinkChoice"
                              required
                              className="w-full bg-white border-3 border-black p-2.5 font-bold text-xs appearance-none focus:outline-none focus:shadow-[4px_4px_0px_#37c35f] transition-all"
                              value={formData.drinkChoice}
                              onChange={handleInputChange}
                            >
                              <option value="" disabled>PILIH MENU MINUMAN</option>
                              {DRINK_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Coffee className="fill-black" size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs font-bold text-gray-600 mt-2">
                        ☕ Makanan & minuman akan disiapin di hari event!
                      </p>
                    </div>

                    {/* Upload Payment Proof */}
                    <div className="space-y-2">
                      <label className="font-black uppercase text-xs">Upload Bukti Bayar *</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#f0f2eb] border-3 border-dashed border-black p-6 font-bold cursor-pointer hover:bg-[#fbd249]/20 transition-all text-center"
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {previewUrl ? (
                          <div className="space-y-2">
                            <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto border-2 border-black" />
                            <p className="text-xs text-green-600 font-black">✓ File ter-upload! Klik buat ganti</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={28} className="text-gray-400" />
                            <p className="text-xs text-gray-600">Klik buat upload bukti transfer</p>
                            <p className="text-xs text-gray-500">JPG, PNG, atau WebP (maks 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#fbd249]/20 border-3 border-[#fbd249] p-3 rounded">
                      <p className="font-bold text-xs text-black">
                        📌 <strong>PENTING:</strong> Jangan lupa TF dulu ke BCA - 5735326594 atau SEABANK - 9012 8311 7886 (A/N M RIFKI RAMDHANI S) ya chat!
                      </p>
                    </div>

                    <div className="pt-2">
                      <BrutalButton 
                        text={isSubmitting ? "MENGIRIM..." : "DAFTAR SEKARANG"} 
                        type="submit"
                        className="w-full py-4 text-base" 
                        disabled={!isFormValid() || isSubmitting}
                      />
                      <p className="text-center mt-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Terbatas 60 kursi chat. Jangan sampe nyesel!
                      </p>
                    </div>
                 </form>
               )}
            </div>
          </div>

          {/* KOLOM KANAN - INFO */}
          <div className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-10">
            <div className="reveal-up opacity-0 translate-y-8 transition-all duration-500 bg-[#fadccc] border-4 border-black p-6 shadow-[8px_8px_0px_black]">
              <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase flex items-center gap-2">
                <Asterisk size={24} className="animate-spin-slow" />
                Yang Lo Dapet
              </h2>
              <ul className="space-y-4">
                {[
                  { title: "OUTPUT KONTEN + E-SERTIFIKAT", desc: "Pulang bawa draft konten yang bisa lo lanjutin posting." },
                  { title: "REVIEW LANGSUNG (NO JUDGING)", desc: "Konten lo dibedah & dibenerin di tempat, step-by-step." },
                  { title: "CIRCLE KECIL, PRAKTEK BARENG", desc: "Nggak sendirian. Kerja bareng temen selevel biar lebih pede." },
                  { title: "KENALAN & Q&A BARENG FOUNDER/PRAKTISI", desc: "Dapet insight yang kepake + bisa tanya kasus lo." },
                  { title: "SNACK/DRINK + LOOP COMMUNITY", desc: "Habis event tetap nyambung lewat circle/temen LOOP." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="bg-black text-white p-1 rounded-sm mt-1 flex-shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase leading-tight">{item.title}</h4>
                      <p className="font-medium text-black/70 leading-tight text-xs mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="reveal-up opacity-0 translate-y-8 transition-all duration-500 bg-[#d23a7d] border-4 border-black p-6 shadow-[8px_8px_0px_black] text-white">
               <div className="flex items-center gap-3 mb-3">
                 <Calendar className="w-6 h-6 flex-shrink-0" />
                 <div>
                   <p className="font-bold text-xs opacity-90">KAPAN</p>
                   <p className="font-black text-lg uppercase">7 Februari 2026</p>
                   <p className="font-black text-lg uppercase">Jam 08.30 - 13.30</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 mb-4">
                 <MapPin className="w-6 h-6 flex-shrink-0" />
                 <div>
                   <p className="font-bold text-xs opacity-90">DIMANA</p>
                   <p className="font-black text-lg uppercase">Kopi Kina Cikini</p>
                 </div>
               </div>
               
               <div className="mt-6 pt-6 border-t-2 border-white/30">
                 <div className="flex items-center gap-2 mb-2">
                   <CreditCard className="w-5 h-5" />
                   <p className="font-black text-xl">Rp 165.000</p>
                 </div>
                 <p className="font-bold text-xs opacity-90 mb-3 bg-black/20 p-2 rounded">
                   ⚠️ TRANSFER KESINI YA CHAT!
                 </p>
                 <div className="bg-black/30 p-3 rounded border-2 border-white/30">
                   <p className="text-xs font-bold mb-2 opacity-80">Transfer ke:</p>
                   <p className="font-black text-base mb-1">BCA - 5735326594</p>
                   <p className="font-black text-base mb-1">SEABANK - 9012 8311 7886</p>
                   <p className="text-xs font-bold">a.n. M RIFKI RAMDHANI S</p>
                 </div>
               </div>
               
               <div className="bg-white/10 p-3 rounded border-2 border-white/30 mt-6 pt-6 border-t-2">
                 <p className="text-xs font-bold mb-2 opacity-90">Ada kendala atau pertanyaan?</p>
                 <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="font-black text-base hover:underline flex items-center gap-2">
                   <Phone size={18} />
                   0819-9553-8939
                 </a>
                 <p className="text-xs mt-1 opacity-80">Hubungi via WhatsApp</p>
               </div>
            </div>
          </div>

        </div>
      </section>

      <Marquee text="Ada Pertanyaan? Email ke hi@paceon.id // Ayo Connect //" direction="right" color="bg-[#fbd249] text-black" />

      {/* --- FAQ SECTION --- */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-28 bg-black text-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-4xl md:text-8xl font-black text-center mb-8 md:mb-12 text-transparent stroke-white stroke-2" style={{ WebkitTextStroke: '1px white' }}>
             F.A.Q.
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { q: "Siapa yang bisa ikut?", a: "Pelajar, mahasiswa, dropout, founder, atau siapapun yang lapar skill nyata." },
              { q: "Gimana cara bayar?", a: "Transfer Rp 165.000 ke Bank yang tertera diatas, terus upload buktinya di form pendaftaran." },
              { q: "Dapet sertifikat?", a: "Iya. Tapi skill dan porto yang lo dapet lebih penting dari file PDF-nya." },
              { q: "Harus bawa tim?", a: "Boleh aja, tapi temen lo isi form juga alias bayar masing-masing." },
              { q: "Bawa apa aja?", a: "Laptop, rasa penasaran, dan vibes positif." },
              { q: "Ada makanan dan minuman?", a: "Ada chat, lo isi aja pilihannya di form!" },
            ].map((item, i) => (
              <div key={i} className="reveal-up opacity-0 translate-y-8 transition-all duration-500 border-2 border-white/20 p-5 md:p-8 hover:bg-white hover:text-black transition-colors duration-200 group">
                <h4 className="font-black text-base md:text-xl mb-2 md:mb-3 group-hover:text-[#d23a7d]">{item.q}</h4>
                <p className="font-medium text-sm md:text-lg opacity-70 group-hover:opacity-100">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />

      {/* --- Simple Footer Area --- */}
      <div className="bg-[#ef6d77] py-8 md:py-12 border-t-4 border-black text-center overflow-hidden">
         <h1 className="text-[12vw] font-black leading-none opacity-20 select-none">PACE ON.</h1>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}