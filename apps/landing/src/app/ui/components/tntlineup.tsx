"use client";
import React, { useState } from "react";

const MENTORS = [
  { id: 1, table: "Table 01", theme: "Navigating Investors and Raising Smart", teaser: "Built a product used by 500K+ users" },
  { id: 2, table: "Table 02", theme: "Scaling When It's Still Early", teaser: "Turned a passion project into a 8-figure brand" },
  { id: 3, table: "Table 03", theme: "Building Brands People Actually Want", teaser: "Backed 20+ early-stage startups" },
  { id: 4, table: "Table 04", theme: "Running a Business That's Also Art", teaser: "Scaled to 9 figures before 25" },
  { id: 5, table: "Table 05", theme: "Leading Yourself, Building for Others", teaser: "Built a movement, not just a business" },
  { id: 6, table: "Table 06", theme: "Building Partnerships That Actually Work", teaser: "From 0 to 1M audience in under a year" },
];

const REDACTED = "████████";

const CARD_COLORS = [
  "#1a2a6c", "#2B3EBF", "#0f1f5c", "#1e2f8f", "#162460", "#243aaa"
];

const SilhouetteSVG = ({ hovered }: { hovered: boolean }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 300 420"
    preserveAspectRatio="xMidYMax meet"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="blur-sil">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <radialGradient id="sil-grad" cx="50%" cy="60%" r="55%">
        <stop offset="0%" stopColor={hovered ? "#E8C12A" : "#4a5fd4"} stopOpacity="0.18" />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g filter="url(#blur-sil)" opacity="0.55">
      <ellipse cx="150" cy="110" rx="52" ry="60" fill="#fff" />
      <rect x="132" y="162" width="36" height="28" rx="8" fill="#fff" />
      <path d="M60 200 Q80 185 132 190 L132 340 Q150 355 168 340 L168 190 Q220 185 240 200 L255 420 L45 420 Z" fill="#fff" />
    </g>
    <rect x="0" y="0" width="300" height="420" fill="url(#sil-grad)" />
  </svg>
);

const MentorCard = ({ mentor, index }: { mentor: typeof MENTORS[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const baseColor = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `3px solid ${hovered ? "#E8C12A" : "#2B3EBF"}`,
        boxShadow: hovered ? "8px 8px 0px #E8C12A" : "4px 4px 0px rgba(43,62,191,0.2)",
        transform: hovered ? "translate(-4px, -4px)" : "translate(0, 0)",
        transition: "all 0.25s ease",
        cursor: "default",
        aspectRatio: "3 / 4",
        minHeight: "360px",
      }}
    >
      {/* Background gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(160deg, ${baseColor} 0%, #050a1a 100%)`,
        zIndex: 0,
      }} />

      {/* Silhouette */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }}>
        <SilhouetteSVG hovered={hovered} />
      </div>

      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: hovered
          ? "linear-gradient(to top, rgba(43,62,191,0.92) 0%, rgba(10,15,60,0.6) 55%, rgba(0,0,0,0.15) 100%)"
          : "linear-gradient(to top, rgba(5,10,26,0.95) 0%, rgba(5,10,26,0.6) 50%, rgba(5,10,26,0.1) 100%)",
        transition: "background 0.3s ease",
        zIndex: 2,
      }} />

      {/* Noise texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* CLASSIFIED stamp */}
      <div style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 5,
        transform: "rotate(8deg)",
        opacity: hovered ? 0 : 0.8,
        transition: "opacity 0.2s",
        border: "2.5px solid rgba(232,193,42,0.7)",
        padding: "3px 8px",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 900,
        fontSize: "9px",
        color: "rgba(232,193,42,0.85)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.18em",
        userSelect: "none" as const,
      }}>
        Classified
      </div>

      {/* Table number top left */}
      <div style={{
        position: "absolute",
        top: "14px",
        left: "16px",
        fontFamily: "'Alfa Slab One', serif",
        fontSize: "13px",
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.1em",
        zIndex: 5,
      }}>
        {mentor.table}
      </div>

      {/* Bottom content */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "24px 20px 22px",
        zIndex: 5,
      }}>
        {/* Redacted name */}
        <div style={{
          fontFamily: "'Alfa Slab One', serif",
          fontSize: "clamp(16px, 2vw, 20px)",
          color: hovered ? "#E8C12A" : "#fff",
          letterSpacing: "0.05em",
          marginBottom: "10px",
          transition: "color 0.2s",
          userSelect: "none" as const,
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}>
          {REDACTED}
        </div>

        {/* Table theme — the main label now */}
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(11px, 1.15vw, 13px)",
          color: hovered ? "#E8C12A" : "rgba(255,255,255,0.9)",
          lineHeight: 1.5,
          marginBottom: "14px",
          transition: "color 0.2s",
          textShadow: "0 1px 6px rgba(0,0,0,0.5)",
        }}>
          {mentor.theme}
        </div>

        {/* Reveal hint */}
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 900,
          fontSize: "9px",
          color: hovered ? "rgba(232,193,42,0.8)" : "rgba(255,255,255,0.3)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.2em",
          transition: "color 0.2s",
        }}>
          {hovered ? "The reveal is coming ✦" : "Identity — classified"}
        </div>
      </div>
    </div>
  );
};

const MentorLineup = () => {
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
        rel="stylesheet"
      />

      <section style={{ background: "#f7e6d4", padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "clamp(40px, 6vh, 64px)" }}>
            <div style={{
              display: "inline-block",
              background: "#E8121A",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              fontSize: "11px",
              color: "#fff",
              textTransform: "uppercase" as const,
              letterSpacing: "0.22em",
              padding: "5px 14px",
              marginBottom: "20px",
              transform: "rotate(-0.5deg)",
            }}>
              Mentor Lineup
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ position: "relative", display: "inline-block", lineHeight: 0.88 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "'Alfa Slab One', serif",
                      fontSize: "clamp(40px, 7vw, 80px)",
                      textTransform: "uppercase" as const,
                      color: "#E8C12A",
                      WebkitTextStroke: "4px #E8C12A",
                      position: "absolute",
                      top: "4px",
                      left: "4px",
                      zIndex: 0,
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    Who&apos;s Speaking?
                  </span>
                  <span
                    style={{
                      fontFamily: "'Alfa Slab One', serif",
                      fontSize: "clamp(40px, 7vw, 80px)",
                      textTransform: "uppercase" as const,
                      color: "#2B3EBF",
                      WebkitTextStroke: "3px #2B3EBF",
                      position: "relative",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      display: "block",
                      // @ts-ignore
                      paintOrder: "stroke fill",
                    }}
                  >
                    Who&apos;s Speaking?
                  </span>
                </div>
              </div>

              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(13px, 1.4vw, 15px)",
                color: "rgba(0,0,0,0.5)",
                maxWidth: "320px",
                lineHeight: 1.7,
                margin: 0,
              }}>
                Let&apos;s just say… you don&apos;t want to miss this.
              </p>
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(220px, 28%, 340px), 1fr))",
            gap: "clamp(16px, 2vw, 24px)",
            marginBottom: "clamp(40px, 6vh, 60px)",
          }}>
            {MENTORS.map((mentor, i) => (
              <MentorCard key={mentor.id} mentor={mentor} index={i} />
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div style={{
            background: "#2B3EBF",
            border: "4px solid #E8C12A",
            padding: "clamp(20px, 3vh, 28px) clamp(24px, 4vw, 40px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}>
            <div>
              <div style={{
                fontFamily: "'Shrikhand', serif",
                fontSize: "clamp(16px, 2.5vw, 24px)",
                color: "#E8C12A",
                letterSpacing: "0.04em",
                marginBottom: "4px",
              }}>
                6 founders. All real. No fluff.
              </div>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(10px, 1.1vw, 13px)",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
              }}>
                Their identities drop on event day ✦
              </div>
            </div>

            <a
              href="/Talk-n-Tales/registrationform"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(12px, 1.4vw, 15px)",
                background: ctaHovered ? "transparent" : "#E8C12A",
                color: ctaHovered ? "#E8C12A" : "#2B3EBF",
                textTransform: "uppercase" as const,
                letterSpacing: "0.12em",
                border: "3px solid #E8C12A",
                padding: "clamp(12px, 1.8vh, 16px) clamp(24px, 3vw, 40px)",
                display: "inline-block",
                textDecoration: "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                transform: ctaHovered ? "translate(-3px, -3px)" : "translate(0, 0)",
                boxShadow: ctaHovered ? "6px 6px 0px #E8C12A" : "none",
              }}
            >
              Secure Your Spot →
            </a>
          </div>

        </div>
      </section>
    </>
  );
};

export default MentorLineup;