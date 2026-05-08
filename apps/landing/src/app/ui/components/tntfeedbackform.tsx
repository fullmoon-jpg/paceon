"use client";
import React, { useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface FeedbackData {
  name: string;
  company: string;
  overallSatisfaction: number;
  enjoyedSession: string;
  meaningfulConnections: string;
  venueRating: number;
  eventFlowRating: number;
  roundtableRating: number;
  discussionRelevance: string;
  roundtableJoined: string;
  speakerRating: number;
  mediatorRating: number;
  mediatorEngaging: string;
  enjoyedMost: string;
  improvements: string;
  joinFutureEvents: string;
  recommend: string;
}

const EMPTY: FeedbackData = {
  name: "", company: "",
  overallSatisfaction: 0, enjoyedSession: "", meaningfulConnections: "",
  venueRating: 0, eventFlowRating: 0,
  roundtableRating: 0, discussionRelevance: "", roundtableJoined: "", speakerRating: 0,
  mediatorRating: 0, mediatorEngaging: "",
  enjoyedMost: "", improvements: "", joinFutureEvents: "", recommend: "",
};

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  red:    "#E8121A",
  blue:   "#2B3EBF",
  yellow: "#E8C12A",
  cream:  "#f7e6d4",
  black:  "#0A0A0A",
  border: "rgba(43,62,191,0.18)",
};

/* ─── Primitives ─────────────────────────────────────────── */
const SectionBlock = ({ number, title, children }: { number?: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      {number && (
        <div style={{
          background: C.red, color: "#fff",
          fontFamily: "'Poppins', sans-serif", fontWeight: 900,
          fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
          padding: "3px 10px", flexShrink: 0,
        }}>{number}</div>
      )}
      <span style={{
        fontFamily: "'Poppins', sans-serif", fontWeight: 900,
        fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
        color: C.red,
      }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
    {children}
  </div>
);

const QuestionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
    fontSize: "clamp(13px, 1.3vw, 15px)", color: C.black,
    margin: "0 0 14px", lineHeight: 1.5,
  }}>{children}</p>
);

/* ─── Star Rating ────────────────────────────────────────── */
const STAR_LABELS: Record<number, { sat: string; perf: string }> = {
  1: { sat: "Very Unsatisfied", perf: "Very Poor" },
  2: { sat: "Unsatisfied",      perf: "Poor" },
  3: { sat: "Neutral",          perf: "Average" },
  4: { sat: "Satisfied",        perf: "Good" },
  5: { sat: "Very Satisfied",   perf: "Excellent" },
};

const StarRating = ({
  value, onChange, variant = "perf",
}: {
  value: number; onChange: (v: number) => void; variant?: "sat" | "perf";
}) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
              fontSize: "clamp(24px, 4vw, 32px)", lineHeight: 1,
              color: n <= display ? C.yellow : "rgba(0,0,0,0.15)",
              filter: n <= display ? "drop-shadow(0 0 2px rgba(232,193,42,0.4))" : "none",
              transition: "color 0.1s, filter 0.1s",
            }}
            aria-label={`${n} — ${STAR_LABELS[n][variant]}`}
          >
            ★
          </button>
        ))}
        {display > 0 && (
          <span style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700,
            fontSize: 11, color: C.blue, letterSpacing: "0.1em",
            textTransform: "uppercase", marginLeft: 6,
          }}>
            {STAR_LABELS[display][variant]}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Radio Options ──────────────────────────────────────── */
const RadioGroup = ({
  options, value, onChange,
}: {
  options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {options.map((opt) => {
      const sel = value === opt;
      return (
        <label
          key={opt}
          style={{
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            padding: "10px 14px",
            border: `2px solid ${sel ? C.blue : C.border}`,
            background: sel ? "rgba(43,62,191,0.05)" : "#fff",
            transition: "all 0.1s",
            fontFamily: "'Poppins', sans-serif", fontWeight: sel ? 700 : 500,
            fontSize: "clamp(12px, 1.2vw, 14px)",
            color: sel ? C.blue : "rgba(0,0,0,0.65)",
          }}
        >
          <input type="radio" value={opt} checked={sel} onChange={() => onChange(opt)} style={{ display: "none" }} />
          <div style={{
            width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
            border: `2.5px solid ${sel ? C.blue : "rgba(43,62,191,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#fff",
          }}>
            {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue }} />}
          </div>
          {opt}
        </label>
      );
    })}
  </div>
);

/* ─── Text Input / Textarea ──────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
  fontSize: "clamp(13px, 1.2vw, 15px)", color: C.black,
  border: `2.5px solid ${C.border}`, borderRadius: 0,
  padding: "11px 14px", outline: "none", boxSizing: "border-box",
  background: "#fff", transition: "border-color 0.15s",
};

const TextInput = ({ placeholder, value, onChange, name }: {
  placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string;
}) => (
  <input
    type="text" name={name} placeholder={placeholder} value={value} onChange={onChange}
    style={inputStyle}
    onFocus={(e) => { e.currentTarget.style.borderColor = C.blue; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
  />
);

const Textarea = ({ placeholder, value, onChange, name }: {
  placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; name: string;
}) => (
  <textarea
    name={name} placeholder={placeholder} value={value} onChange={onChange} rows={5}
    style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
    onFocus={(e) => { e.currentTarget.style.borderColor = C.blue; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
  />
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{
    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em",
    color: C.blue, display: "block", marginBottom: 8,
  }}>{children}</label>
);

/* ─── Question wrapper ───────────────────────────────────── */
const Q = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
    <div style={{
      fontFamily: "'Alfa Slab One', serif",
      fontSize: "clamp(10px, 1vw, 12px)", color: C.red,
      textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10,
    }}>
      Q{n}
    </div>
    {children}
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
export default function TNTFeedbackForm() {
  const [form, setForm] = useState<FeedbackData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FeedbackData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(e.target.name as keyof FeedbackData, e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (form.overallSatisfaction === 0) { setError("Please rate your overall satisfaction (Q1)."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/talk-n-tales-2/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          overall_satisfaction: form.overallSatisfaction,
          enjoyed_session: form.enjoyedSession,
          meaningful_connections: form.meaningfulConnections,
          venue_rating: form.venueRating,
          event_flow_rating: form.eventFlowRating,
          roundtable_rating: form.roundtableRating,
          discussion_relevance: form.discussionRelevance,
          roundtable_joined: form.roundtableJoined,
          speaker_rating: form.speakerRating,
          mediator_rating: form.mediatorRating,
          mediator_engaging: form.mediatorEngaging,
          enjoyed_most: form.enjoyedMost,
          improvements: form.improvements,
          join_future_events: form.joinFutureEvents,
          recommend: form.recommend,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <div style={{ minHeight: "100vh", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 520 }}>
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              background: C.yellow, border: `6px solid #fff`,
              padding: "28px 40px", marginBottom: 32, transform: "rotate(-1.5deg)",
            }}>
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(40px, 8vw, 64px)", color: C.blue, lineHeight: 1, textTransform: "uppercase" }}>
                ✓ SENT
              </span>
              <div style={{ width: "100%", height: 3, background: C.blue, margin: "10px 0" }} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: 10, color: C.blue, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                Feedback Received
              </span>
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(13px, 1.4vw, 15px)", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
              Thank you for taking the time — your feedback genuinely helps us build better events for the community.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;500;700;900&display=swap" rel="stylesheet" />
      <style>{`
        .tnt-fb-page { min-height: 100vh; background: ${C.cream}; }
        .tnt-fb-hero {
          background: ${C.blue};
          padding: clamp(48px,8vh,96px) clamp(24px,8vw,96px) clamp(36px,5vh,64px);
          position: relative; overflow: hidden;
        }
        .tnt-fb-hero::before {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(232,193,42,0.05) 39px,rgba(232,193,42,0.05) 40px);
          pointer-events: none;
        }
        .tnt-fb-body { max-width: 760px; margin: 0 auto; padding: clamp(40px,6vh,72px) clamp(24px,6vw,80px); }
        .tnt-fb-card { background: #fff; border: 3px solid ${C.blue}; padding: clamp(28px,4vw,48px); margin-bottom: 32px; }
        input::placeholder, textarea::placeholder { color: #aaa; font-weight: 400; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="tnt-fb-page">

        {/* ── Hero ── */}
        <div className="tnt-fb-hero">
          <div style={{ maxWidth: 900, position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                background: C.red, color: "#fff",
                fontFamily: "'Poppins', sans-serif", fontWeight: 900,
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                padding: "4px 12px",
              }}>Talk n Tales Vol. 2</span>
            </div>
            <div style={{ position: "relative", display: "inline-block", lineHeight: 0.88 }}>
              <span aria-hidden="true" style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(44px, 9vw, 96px)",
                textTransform: "uppercase", letterSpacing: "0.02em",
                color: C.yellow, WebkitTextStroke: `4px ${C.yellow}`,
                position: "absolute", top: 5, left: 5, zIndex: 0,
                whiteSpace: "nowrap", display: "block",
              }}>Feedback</span>
              <span style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(44px, 9vw, 96px)",
                textTransform: "uppercase", letterSpacing: "0.02em",
                color: "#fff", WebkitTextStroke: `3px ${C.blue}`,
                position: "relative", zIndex: 1,
                whiteSpace: "nowrap", display: "block",
              }}>Feedback</span>
            </div>
            <p style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: "clamp(13px, 1.3vw, 15px)", color: "rgba(255,255,255,0.65)",
              lineHeight: 1.75, marginTop: 20, maxWidth: 520,
            }}>
              Thank you for being part of Talk n Tales #2. Your feedback will help us improve future sessions and create a better experience for the community.
            </p>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="tnt-fb-body">
          <form onSubmit={handleSubmit} noValidate>

            {/* Basic Info */}
            <div className="tnt-fb-card">
              <SectionBlock title="Basic Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Name <span style={{ color: C.red }}>*</span></FieldLabel>
                    <TextInput name="name" placeholder="Your full name" value={form.name} onChange={handleChange} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Business / Company</FieldLabel>
                    <TextInput name="company" placeholder="Your company or startup" value={form.company} onChange={handleChange} />
                  </div>
                </div>
              </SectionBlock>
            </div>

            {/* Event Experience */}
            <div className="tnt-fb-card">
              <SectionBlock title="Event Experience">
                <Q n={1}>
                  <QuestionLabel>Overall, how satisfied are you with Talk n Tales #2?</QuestionLabel>
                  <StarRating value={form.overallSatisfaction} onChange={(v) => set("overallSatisfaction", v)} variant="sat" />
                </Q>
                <Q n={2}>
                  <QuestionLabel>Which session did you enjoy the most?</QuestionLabel>
                  <RadioGroup
                    options={["Group Game Session", "Senior Founder Roundtable", "Speed Networking", "Connection & Collaboration Exploration"]}
                    value={form.enjoyedSession}
                    onChange={(v) => set("enjoyedSession", v)}
                  />
                </Q>
                <Q n={3}>
                  <QuestionLabel>Did you make meaningful new connections during the event?</QuestionLabel>
                  <RadioGroup
                    options={["Yes", "Maybe", "No"]}
                    value={form.meaningfulConnections}
                    onChange={(v) => set("meaningfulConnections", v)}
                  />
                </Q>
              </SectionBlock>
            </div>

            {/* Venue & Event Flow */}
            <div className="tnt-fb-card">
              <SectionBlock title="Venue & Event Flow">
                <Q n={4}>
                  <QuestionLabel>How would you rate the venue experience?</QuestionLabel>
                  <StarRating value={form.venueRating} onChange={(v) => set("venueRating", v)} />
                </Q>
                <Q n={5}>
                  <QuestionLabel>How was the overall flow and timing of the event?</QuestionLabel>
                  <StarRating value={form.eventFlowRating} onChange={(v) => set("eventFlowRating", v)} />
                </Q>
              </SectionBlock>
            </div>

            {/* Speaker & Roundtable */}
            <div className="tnt-fb-card">
              <SectionBlock title="Speaker & Roundtable">
                <Q n={6}>
                  <QuestionLabel>How would you rate the Senior Founder Roundtable session overall?</QuestionLabel>
                  <StarRating value={form.roundtableRating} onChange={(v) => set("roundtableRating", v)} />
                </Q>
                <Q n={7}>
                  <QuestionLabel>Was the discussion topic relevant to you?</QuestionLabel>
                  <RadioGroup
                    options={["Very Relevant", "Relevant", "Neutral", "Less Relevant", "Not Relevant"]}
                    value={form.discussionRelevance}
                    onChange={(v) => set("discussionRelevance", v)}
                  />
                </Q>
                <Q n={8}>
                  <QuestionLabel>Which roundtable did you join?</QuestionLabel>
                  <RadioGroup
                    options={[
                      "Navigating Investors and Raising Smart",
                      "Scaling When It's Still Early",
                      "Building Brands People Actually Want",
                      "Running a Business That's Also Art",
                      "Leading Yourself, Building for Others",
                      "Building Partnerships That Actually Work",
                    ]}
                    value={form.roundtableJoined}
                    onChange={(v) => set("roundtableJoined", v)}
                  />
                </Q>
                <Q n={9}>
                  <QuestionLabel>How would you rate the speaker at your table?</QuestionLabel>
                  <StarRating value={form.speakerRating} onChange={(v) => set("speakerRating", v)} />
                </Q>
              </SectionBlock>
            </div>

            {/* Mediator Experience */}
            <div className="tnt-fb-card">
              <SectionBlock title="Mediator Experience">
                <Q n={10}>
                  <QuestionLabel>How would you rate your session mediator?</QuestionLabel>
                  <StarRating value={form.mediatorRating} onChange={(v) => set("mediatorRating", v)} />
                </Q>
                <Q n={11}>
                  <QuestionLabel>Did the mediator help keep the discussion engaging and interactive?</QuestionLabel>
                  <RadioGroup
                    options={["Yes", "Somewhat", "No"]}
                    value={form.mediatorEngaging}
                    onChange={(v) => set("mediatorEngaging", v)}
                  />
                </Q>
              </SectionBlock>
            </div>

            {/* Final Feedback */}
            <div className="tnt-fb-card">
              <SectionBlock title="Final Feedback">
                <Q n={12}>
                  <QuestionLabel>What did you enjoy the most from Talk n Tales #2?</QuestionLabel>
                  <Textarea name="enjoyedMost" placeholder="Tell us what stood out..." value={form.enjoyedMost} onChange={handleChange} />
                </Q>
                <Q n={13}>
                  <QuestionLabel>What can we improve for the next Talk n Tales?</QuestionLabel>
                  <Textarea name="improvements" placeholder="Be honest — we appreciate it." value={form.improvements} onChange={handleChange} />
                </Q>
                <Q n={14}>
                  <QuestionLabel>Would you join future PACE ON events?</QuestionLabel>
                  <RadioGroup
                    options={["Yes", "Maybe", "No"]}
                    value={form.joinFutureEvents}
                    onChange={(v) => set("joinFutureEvents", v)}
                  />
                </Q>
                <Q n={15}>
                  <QuestionLabel>Would you recommend Talk n Tales to other founders?</QuestionLabel>
                  <RadioGroup
                    options={["Yes", "Maybe", "No"]}
                    value={form.recommend}
                    onChange={(v) => set("recommend", v)}
                  />
                </Q>
              </SectionBlock>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: C.red, color: "#fff",
                fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13,
                padding: "12px 16px", marginBottom: 20, border: `3px solid #a00`,
              }}>⚠ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(14px, 1.8vw, 18px)",
                background: C.blue, color: C.yellow,
                textTransform: "uppercase", letterSpacing: "0.12em",
                border: `4px solid ${C.blue}`,
                padding: "clamp(14px,2vh,20px) clamp(36px,5vw,64px)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex", alignItems: "center", gap: 12,
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={(e) => { if (loading) return; const el = e.currentTarget; el.style.background = "transparent"; el.style.color = C.blue; el.style.transform = "translate(-4px,-4px)"; el.style.boxShadow = `8px 8px 0px ${C.blue}`; }}
              onMouseLeave={(e) => { if (loading) return; const el = e.currentTarget; el.style.background = C.blue; el.style.color = C.yellow; el.style.transform = "translate(0,0)"; el.style.boxShadow = "none"; }}
            >
              {loading
                ? <><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> Submitting...</>
                : "Submit Feedback →"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}
