"use client";
import React, { useState } from "react";
import Image from "next/image";

const MENTORS = [
  { id: 1, table: "Table 01", theme: "Building Partnerships That Actually Work", name: "Dinno Ardiansyah", photo: "/images/dinno.jpg", tagline: "The Man behind Minutes of Manager, Muda Mudahan, and MURKA." },
  { id: 2, table: "Table 02", theme: "Scaling When It's Still Early", name: "Novan Adrian", photo: "/images/novannn.png", tagline: "The Tech Mind Empowering Millions of UMKM Through Qasir.id" },
  { id: 3, table: "Table 03", theme: "Leading Yourself, Building for Others", name: "Ilona Kakerissa", photo: "/images/ilona.jpeg", tagline: "The Woman Behind Educational Impact and Teach First Indonesia" },
  { id: 4, table: "Table 04", theme: "Building Brands People Actually Want" }, 
  { id: 5, table: "Table 05", theme: "Running a Business That's Also Art" }, 
  { id: 6, table: "Table 06", theme: "Navigating Investors and Raising Smart" },
];

const CARD_COLORS = [
  "#1a2a6c",
  "#2B3EBF",
  "#0f1f5c",
  "#1e2f8f",
  "#162460",
  "#243aaa",
];

const REDACTED = "████████";

// Unique filter ID per card to avoid SVG filter conflicts
const SilhouetteSVG = ({ id, hovered }: { id: number; hovered: boolean }) => (
  <svg
    viewBox="0 0 300 420"
    preserveAspectRatio="xMidYMax meet"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      display: "block",
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id={`sblur-${id}`}>
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <radialGradient id={`sil-grad-${id}`} cx="50%" cy="60%" r="55%">
        <stop
          offset="0%"
          stopColor={hovered ? "#E8C12A" : "#4a5fd4"}
          stopOpacity="0.18"
        />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g filter={`url(#sblur-${id})`} opacity="0.55">
      <ellipse cx="150" cy="110" rx="52" ry="60" fill="#fff" />
      <rect x="132" y="162" width="36" height="28" rx="8" fill="#fff" />
      <path
        d="M60 200 Q80 185 132 190 L132 340 Q150 355 168 340 L168 190 Q220 185 240 200 L255 420 L45 420 Z"
        fill="#fff"
      />
    </g>
    <rect
      x="0"
      y="0"
      width="300"
      height="420"
      fill={`url(#sil-grad-${id})`}
    />
  </svg>
);

const MentorCard = ({
  mentor,
  index,
}: {
  mentor: (typeof MENTORS)[0];
  index: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const baseColor = CARD_COLORS[index % CARD_COLORS.length];
  const revealed = !!mentor.photo;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `3px solid ${hovered ? "#E8C12A" : "#2B3EBF"}`,
        boxShadow: hovered
          ? "8px 8px 0px #E8C12A"
          : "4px 4px 0px rgba(43,62,191,0.2)",
        transform: hovered ? "translate(-4px, -4px)" : "translate(0, 0)",
        transition: "all 0.25s ease",
        cursor: "default",
        aspectRatio: "3 / 4",
        minHeight: "280px",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${baseColor} 0%, #050a1a 100%)`,
          zIndex: 0,
        }}
      />

      {/* Photo or silhouette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {revealed ? (
          <Image
            src={mentor.photo!}
            alt={mentor.name ?? "Speaker"}
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        ) : (
          <SilhouetteSVG id={mentor.id} hovered={hovered} />
        )}
      </div>

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: revealed
            ? "linear-gradient(to top, rgba(5,10,26,0.92) 0%, rgba(5,10,26,0.3) 50%, rgba(0,0,0,0) 100%)"
            : hovered
            ? "linear-gradient(to top, rgba(43,62,191,0.92) 0%, rgba(10,15,60,0.6) 55%, rgba(0,0,0,0.15) 100%)"
            : "linear-gradient(to top, rgba(5,10,26,0.95) 0%, rgba(5,10,26,0.6) 50%, rgba(5,10,26,0.1) 100%)",
          transition: "background 0.3s ease",
          zIndex: 2,
        }}
      />

      {/* CLASSIFIED stamp — only when identity hidden */}
      {!revealed && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            zIndex: 5,
            transform: "rotate(8deg)",
            opacity: hovered ? 0 : 0.8,
            transition: "opacity 0.2s",
            border: "2px solid rgba(232,193,42,0.7)",
            padding: "3px 7px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: "8px",
            color: "rgba(232,193,42,0.85)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.18em",
            userSelect: "none" as const,
          }}
        >
          Classified
        </div>
      )}

      {/* Table number */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "14px",
          fontFamily: "'Alfa Slab One', serif",
          fontSize: "11px",
          color: "rgba(255,255,255,0.33)",
          letterSpacing: "0.1em",
          zIndex: 5,
        }}
      >
        {mentor.table}
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "clamp(14px, 2.5vh, 24px) clamp(14px, 2vw, 20px) clamp(14px, 2.5vh, 20px)",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: "'Alfa Slab One', serif",
            fontSize: "clamp(14px, 1.6vw, 20px)",
            color: hovered ? "#E8C12A" : "#fff",
            letterSpacing: "0.05em",
            marginBottom: "8px",
            transition: "color 0.2s",
            userSelect: "none" as const,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {revealed ? mentor.name : REDACTED}
        </div>

        {revealed && mentor.tagline && (
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "clamp(9px, 0.9vw, 11px)",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.4,
              marginBottom: "8px",
            }}
          >
            {mentor.tagline}
          </div>
        )}

        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(10px, 1.1vw, 13px)",
            color: hovered ? "#E8C12A" : "rgba(255,255,255,0.9)",
            lineHeight: 1.5,
            marginBottom: "12px",
            transition: "color 0.2s",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          {mentor.theme}
        </div>

        {!revealed && (
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              fontSize: "8px",
              color: hovered
                ? "rgba(232,193,42,0.8)"
                : "rgba(255,255,255,0.3)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.2em",
              transition: "color 0.2s",
            }}
          >
            {hovered ? "The reveal is coming ✦" : "Identity — classified"}
          </div>
        )}
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

      {/* Responsive grid styles injected via a style tag */}
      <style>{`
        .mentor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(12px, 1.8vw, 24px);
          margin-bottom: clamp(28px, 5vh, 56px);
        }
        @media (max-width: 900px) {
          .mentor-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 540px) {
          .mentor-grid {
            grid-template-columns: 1fr;
          }
          .mentor-header-sub {
            max-width: 100% !important;
          }
          .mentor-title-shadow,
          .mentor-title-main {
            white-space: normal !important;
            font-size: clamp(28px, 9vw, 48px) !important;
          }
        }
      `}</style>

      <section
        style={{
          background: "#f7e6d4",
          padding:
            "clamp(40px, 8vh, 100px) clamp(16px, 5vw, 80px)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "clamp(28px, 5vh, 56px)" }}>
            <div
              style={{
                display: "inline-block",
                background: "#E8121A",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "10px",
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                padding: "5px 14px",
                marginBottom: "18px",
                transform: "rotate(-0.5deg)",
              }}
            >
              Mentor Lineup
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* Title with offset shadow */}
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* Shadow layer */}
                <span
                  aria-hidden="true"
                  className="mentor-title-shadow"
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "clamp(32px, 6vw, 80px)",
                    textTransform: "uppercase",
                    color: "#E8C12A",
                    position: "absolute",
                    top: "4px",
                    left: "4px",
                    whiteSpace: "nowrap",
                    lineHeight: 0.88,
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "block",
                  }}
                >
                  WHO&apos;S SPEAKING?
                </span>
                {/* Main layer */}
                <span
                  className="mentor-title-main"
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "clamp(32px, 6vw, 80px)",
                    textTransform: "uppercase",
                    color: "#2B3EBF",
                    position: "relative",
                    whiteSpace: "nowrap",
                    lineHeight: 0.88,
                    display: "block",
                  }}
                >
                  WHO&apos;S SPEAKING?
                </span>
              </div>

              <p
                className="mentor-header-sub"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(12px, 1.3vw, 15px)",
                  color: "rgba(0,0,0,0.48)",
                  maxWidth: "300px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Let&apos;s just say… you don&apos;t want to miss this.
              </p>
            </div>
          </div>

          {/* Cards grid */}
          <div className="mentor-grid">
            {MENTORS.map((mentor, i) => (
              <MentorCard key={mentor.id} mentor={mentor} index={i} />
            ))}
          </div>

          {/* CTA strip */}
          <div
            style={{
              background: "#2B3EBF",
              border: "4px solid #E8C12A",
              padding:
                "clamp(16px, 3vh, 28px) clamp(18px, 4vw, 40px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Shrikhand', serif",
                  fontSize: "clamp(14px, 2.2vw, 24px)",
                  color: "#E8C12A",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                6 founders. All real. No fluff.
              </div>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(9px, 1vw, 12px)",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                Their identities will drop soon ✦
              </div>
            </div>

            <a
              href="/Talk-n-Tales/registrationform"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                fontFamily: "'Alfa Slab One', serif",
                fontSize: "clamp(11px, 1.3vw, 14px)",
                background: ctaHovered ? "transparent" : "#E8C12A",
                color: ctaHovered ? "#E8C12A" : "#2B3EBF",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                border: "3px solid #E8C12A",
                padding:
                  "clamp(10px, 1.6vh, 16px) clamp(18px, 2.5vw, 36px)",
                display: "inline-block",
                textDecoration: "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                transform: ctaHovered
                  ? "translate(-3px, -3px)"
                  : "translate(0, 0)",
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