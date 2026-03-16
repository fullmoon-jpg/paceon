"use client";
import React, { useState } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────── */
interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  businessName: string;
  industry: string;
  topicInterest: string;
  mainReason: string;
  lookingFor: string[];
  agreeToTerms: boolean;
}

const INDUSTRIES = [
  "Technology",
  "Creative & Media",
  "E-commerce",
  "Fashion & Lifestyle",
  "Food & Beverage",
  "Education",
  "Sustainability & Climate",
  "Social Impact / NGO",
  "Finance & Fintech",
  "Legal & Compliance",
  "Health & Wellness",
  "Professional Services & Consulting",
  "Other",
];

const TOPIC_INTERESTS = [
  "Fundraising & working with investors",
  "Growing a startup from early traction",
  "Building consumer brands & creative businesses",
  "Founder journey & leadership",
  "Collaboration & partnership opportunities",
];

const LOOKING_FOR_OPTIONS = [
  "Business partners / collaborators",
  "Investors",
  "New connections",
  "Learning from other founders",
  "Potential clients",
];

/* ─── Reusable field components ─────────────────────────── */
const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      fontSize: "clamp(10px, 1vw, 12px)",
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      color: "#2B3EBF",
      display: "block",
      marginBottom: "8px",
    }}
  >
    {children}
    {required && (
      <span style={{ color: "#E8121A", marginLeft: "4px" }}>*</span>
    )}
  </label>
);

const inputBase: React.CSSProperties = {
  width: "100%",
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: "clamp(13px, 1.3vw, 15px)",
  color: "#1a1a1a",
  background: "#fff",
  border: "3px solid #2B3EBF",
  borderRadius: 0,
  padding: "12px 14px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  boxSizing: "border-box" as const,
};

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  name: keyof FormData;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <div style={{ marginBottom: "24px" }}>
    <FieldLabel required={required}>{label}</FieldLabel>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={inputBase}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#E8C12A";
        e.currentTarget.style.boxShadow = "4px 4px 0px #2B3EBF";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#2B3EBF";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  </div>
);

const TextareaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  required,
  rows = 4,
}: {
  label: string;
  name: keyof FormData;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}) => (
  <div style={{ marginBottom: "24px" }}>
    <FieldLabel required={required}>{label}</FieldLabel>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      style={{ ...inputBase, resize: "vertical", minHeight: "110px" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#E8C12A";
        e.currentTarget.style.boxShadow = "4px 4px 0px #2B3EBF";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#2B3EBF";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  </div>
);

/* Radio group (single select) */
const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  name: keyof FormData;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) => (
  <div style={{ marginBottom: "28px" }}>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: selected ? 700 : 500,
              fontSize: "clamp(12px, 1.2vw, 14px)",
              color: selected ? "#2B3EBF" : "rgba(0,0,0,0.65)",
              padding: "10px 14px",
              border: `2px solid ${selected ? "#2B3EBF" : "rgba(43,62,191,0.2)"}`,
              background: selected ? "rgba(43,62,191,0.06)" : "#fff",
              transition: "all 0.12s",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={selected}
              onChange={() => onChange(opt)}
              required={required}
              style={{ display: "none" }}
            />
            {/* Custom radio dot */}
            <div
              style={{
                width: "18px",
                height: "18px",
                border: `3px solid ${selected ? "#2B3EBF" : "rgba(43,62,191,0.35)"}`,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
              }}
            >
              {selected && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#2B3EBF",
                  }}
                />
              )}
            </div>
            {opt}
          </label>
        );
      })}
    </div>
  </div>
);

/* Checkbox group (multi select) */
const CheckboxGroup = ({
  label,
  options,
  values,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
  required?: boolean;
}) => {
  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <div style={{ marginBottom: "28px" }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: checked ? 700 : 500,
                fontSize: "clamp(12px, 1.2vw, 14px)",
                color: checked ? "#2B3EBF" : "rgba(0,0,0,0.65)",
                padding: "10px 14px",
                border: `2px solid ${checked ? "#2B3EBF" : "rgba(43,62,191,0.2)"}`,
                background: checked ? "rgba(43,62,191,0.06)" : "#fff",
                transition: "all 0.12s",
              }}
            >
              <input
                type="checkbox"
                value={opt}
                checked={checked}
                onChange={() => toggle(opt)}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  border: `3px solid ${checked ? "#2B3EBF" : "rgba(43,62,191,0.35)"}`,
                  flexShrink: 0,
                  background: checked ? "#2B3EBF" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.12s",
                }}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 3.5L3.8 6.5L9 1"
                      stroke="#E8C12A"
                      strokeWidth="2.2"
                      strokeLinecap="square"
                    />
                  </svg>
                )}
              </div>
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
};

/* Section divider */
const SectionDivider = ({ title }: { title: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      margin: "36px 0 28px",
    }}
  >
    <div
      style={{
        background: "#E8121A",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 900,
        fontSize: "10px",
        color: "#fff",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        padding: "4px 12px",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {title}
    </div>
    <div
      style={{ flex: 1, height: "2px", background: "rgba(43,62,191,0.2)" }}
    />
  </div>
);

/* ─── Main Page ─────────────────────────────────────────── */
const TalkNTalesRegisterPage = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    instagram: "",
    linkedin: "",
    businessName: "",
    industry: "",
    topicInterest: "",
    mainReason: "",
    lookingFor: [],
    agreeToTerms: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lookingFor.length === 0) {
      setError("Please select at least one option for what you're looking for.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/talk-n-tales-2/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.whatsapp,
          instagram: formData.instagram,
          linkedin_url: formData.linkedin,
          company: formData.businessName,
          company_industry: formData.industry,
          topic_interest: formData.topicInterest,
          reason: formData.mainReason,
          looking_for: formData.lookingFor,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
          rel="stylesheet"
        />
        <div
          style={{
            minHeight: "100vh",
            background: "#2B3EBF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "560px" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#E8C12A",
                border: "6px solid #fff",
                padding: "28px 36px",
                marginBottom: "32px",
                transform: "rotate(-2deg)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  fontSize: "clamp(48px, 10vw, 80px)",
                  color: "#2B3EBF",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                ✓ DONE
              </span>
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  background: "#2B3EBF",
                  margin: "10px 0",
                }}
              />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: "11px",
                  color: "#2B3EBF",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Registration Submitted
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Shrikhand', serif",
                fontSize: "clamp(18px, 3vw, 26px)",
                color: "#E8C12A",
                letterSpacing: "0.04em",
                marginBottom: "16px",
              }}
            >
              You&apos;re on the list. We&apos;ll be in touch.
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(13px, 1.4vw, 15px)",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.75,
                marginBottom: "36px",
              }}
            >
              Check your inbox for a confirmation email. Official announcement will follow. Don&apos;t forget to check your spam folder!
            </p>

            <Link
              href="/Talk-n-Tales"
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                background: "#E8C12A",
                color: "#2B3EBF",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                border: "3px solid #E8C12A",
                padding: "14px 36px",
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              ← Back to Event Page
            </Link>
          </div>
        </div>
      </>
    );
  }

  /* ── Form ── */
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .tnt-form-page { min-height: 100vh; background: #f7e6d4; }
        .tnt-reg-hero {
          background: #2B3EBF;
          padding: clamp(40px,7vh,80px) clamp(20px,6vw,80px) clamp(32px,5vh,56px);
          position: relative; overflow: hidden;
        }
        .tnt-reg-hero::before {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(232,193,42,0.06) 39px,rgba(232,193,42,0.06) 40px);
          pointer-events: none;
        }
        .tnt-form-grid {
          display: grid; grid-template-columns: 1fr; gap: 0 40px;
        }
        @media (min-width: 768px) {
          .tnt-form-grid { grid-template-columns: 1fr 1fr; }
        }
        .tnt-form-outer { display: block; }
        @media (min-width: 1024px) {
          .tnt-form-outer {
            display: grid; grid-template-columns: 1fr 300px;
            gap: 40px; align-items: start;
          }
          .tnt-sidebar { display: block !important; position: sticky; top: 24px; }
        }
        input::placeholder, textarea::placeholder { color: #aaa; font-weight: 400; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="tnt-form-page">

        {/* Hero */}
        <div className="tnt-reg-hero">
          <div style={{ maxWidth: "900px", position: "relative", zIndex: 1 }}>
            {/* Back link */}
            <div style={{ marginBottom: "24px" }}>
              <Link
                href="/Talk-n-Tales"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(10px, 1vw, 12px)",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  textDecoration: "none",
                }}
              >
                ← Back to Event
              </Link>
            </div>

            {/* Headline only */}
            <div style={{ position: "relative", display: "inline-block", lineHeight: 0.88 }}>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  fontSize: "clamp(52px, 10vw, 110px)",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: "#E8C12A",
                  WebkitTextStroke: "5px #E8C12A",
                  position: "absolute",
                  top: "5px",
                  left: "5px",
                  zIndex: 0,
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                Register
              </span>
              <span
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  fontSize: "clamp(52px, 10vw, 110px)",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: "#fff",
                  WebkitTextStroke: "4px #2B3EBF",
                  position: "relative",
                  zIndex: 1,
                  whiteSpace: "nowrap",
                  display: "block",
                  // @ts-ignore
                  paintOrder: "stroke fill",
                }}
              >
                Register
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding:
              "clamp(32px, 5vh, 64px) clamp(20px, 6vw, 80px)",
          }}
        >
          <div className="tnt-form-outer">

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              <SectionDivider title="Personal Info" />
              <div className="tnt-form-grid">
                <InputField
                  label="Full Name"
                  name="fullName"
                  placeholder="e.g. Budi Santoso"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="WhatsApp Number"
                  name="whatsapp"
                  type="tel"
                  placeholder="+62 812 xxxx xxxx"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Instagram Handle"
                  name="instagram"
                  placeholder="@yourhandle"
                  value={formData.instagram}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="LinkedIn Profile"
                  name="linkedin"
                  placeholder="linkedin.com/in/yourname"
                  value={formData.linkedin}
                  onChange={handleChange}
                  required
                />
              </div>

              <SectionDivider title="Business Info" />
              <div className="tnt-form-grid">
                <InputField
                  label="Business / Startup Name"
                  name="businessName"
                  placeholder="e.g. Kopiku, Toko Kreatif"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <RadioGroup
                label="Industry"
                name="industry"
                options={INDUSTRIES}
                value={formData.industry}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, industry: val }))
                }
                required
              />

              <SectionDivider title="Your Interests" />

              <RadioGroup
                label="Which discussion would interest you the most at Talk N Tales?"
                name="topicInterest"
                options={TOPIC_INTERESTS}
                value={formData.topicInterest}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, topicInterest: val }))
                }
                required
              />

              <TextareaField
                label="What is your main reason for joining Talk N Tales?"
                name="mainReason"
                placeholder="Tell us briefly — be genuine, we read every submission."
                value={formData.mainReason}
                onChange={handleChange}
                required
                rows={4}
              />

              <CheckboxGroup
                label="What are you currently looking for?"
                options={LOOKING_FOR_OPTIONS}
                values={formData.lookingFor}
                onChange={(vals) =>
                  setFormData((prev) => ({ ...prev, lookingFor: vals }))
                }
                required
              />

              {/* Terms */}
              <div style={{ marginBottom: "32px", marginTop: "8px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0, marginTop: "2px" }}>
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      style={{
                        opacity: 0,
                        position: "absolute",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        border: "3px solid #2B3EBF",
                        background: formData.agreeToTerms ? "#2B3EBF" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.15s",
                      }}
                    >
                      {formData.agreeToTerms && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path
                            d="M1 4L4.5 7.5L11 1"
                            stroke="#E8C12A"
                            strokeWidth="2.5"
                            strokeLinecap="square"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(12px, 1.2vw, 14px)",
                      color: "rgba(0,0,0,0.7)",
                      lineHeight: 1.65,
                    }}
                  >
                    I understand that registration does not guarantee a spot. Selected participants will be notified via email. I agree to the event terms and conditions.
                  </span>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div
                  style={{
                    background: "#E8121A",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    border: "3px solid #a00",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !formData.agreeToTerms}
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  fontSize: "clamp(14px, 1.8vw, 18px)",
                  background: formData.agreeToTerms ? "#2B3EBF" : "#aaa",
                  color: "#E8C12A",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  border: `4px solid ${formData.agreeToTerms ? "#2B3EBF" : "#aaa"}`,
                  padding:
                    "clamp(14px, 2vh, 20px) clamp(36px, 5vw, 64px)",
                  cursor: formData.agreeToTerms ? "pointer" : "not-allowed",
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  opacity: loading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!formData.agreeToTerms) return;
                  const el = e.currentTarget;
                  el.style.background = "transparent";
                  el.style.color = "#2B3EBF";
                  el.style.transform = "translate(-4px,-4px)";
                  el.style.boxShadow = "8px 8px 0px #2B3EBF";
                }}
                onMouseLeave={(e) => {
                  if (!formData.agreeToTerms) return;
                  const el = e.currentTarget;
                  el.style.background = "#2B3EBF";
                  el.style.color = "#E8C12A";
                  el.style.transform = "translate(0,0)";
                  el.style.boxShadow = "none";
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    >
                      ⟳
                    </span>
                    Submitting...
                  </>
                ) : (
                  "Submit Registration →"
                )}
              </button>

              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  marginTop: "14px",
                }}
              >
                ✦ Community Early bird: IDR 199K until 30 March 2026 ✦
              </p>
            </form>

            {/* Sidebar */}
            <aside className="tnt-sidebar" style={{ display: "none" }}>
              <div
                style={{
                  background: "#2B3EBF",
                  border: "4px solid #E8C12A",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 900,
                    fontSize: "10px",
                    color: "#E8C12A",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginBottom: "16px",
                  }}
                >
                  Event Details
                </div>
                {[
                  { label: "Date", value: "Saturday, 9 May 2026" },
                  { label: "Time", value: "19.00 WIB – End" },
                  { label: "Location", value: "South Jakarta\n(TBA)" },
                  { label: "Price", value: "IDR 199K\n(Community Early Bird)" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "9px",
                        color: "rgba(232,193,42,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        marginBottom: "3px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#fff",
                        lineHeight: 1.4,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#E8C12A",
                  border: "4px solid #2B3EBF",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "16px",
                    color: "#2B3EBF",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  Highlights
                </div>
                {[
                  "Roundtable with Senior Founder",
                  "Curated Founder Networking",
                  "Speed Networking Session",
                  "Selected Founders Elevator Pitch",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#2B3EBF",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ color: "#E8121A", fontWeight: 900, flexShrink: 0 }}
                    >
                      ✦
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#E8121A",
                  padding: "16px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 900,
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginBottom: "6px",
                  }}
                >
                  Early Bird Until
                </div>
                <div
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "20px",
                    color: "#E8C12A",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  30 March 2026
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default TalkNTalesRegisterPage;