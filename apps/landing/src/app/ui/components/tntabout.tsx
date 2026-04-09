"use client";
import React from "react";

const TOTAL_SEATS = 30;
const SEATS_FILLED = 12;

const LayeredWordAbout = ({
  text,
  color = "#fff",
  shadowColor = "#2B3EBF",
  size = "clamp(40px, 7vw, 96px)",
}: {
  text: string;
  color?: string;
  shadowColor?: string;
  size?: string;
}) => (
  <div style={{ position: "relative", display: "inline-block", lineHeight: 0.88 }}>
    <span
      aria-hidden="true"
      style={{
        fontFamily: "'Alfa Slab One', serif",
        fontSize: size,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        color: shadowColor,
        WebkitTextStroke: `5px ${shadowColor}`,
        position: "absolute",
        top: "5px",
        left: "5px",
        zIndex: 0,
        whiteSpace: "nowrap",
        display: "block",
      }}
    >
      {text}
    </span>
    <span
      style={{
        fontFamily: "'Alfa Slab One', serif",
        fontSize: size,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        color: color,
        WebkitTextStroke: `3px ${shadowColor}`,
        position: "relative",
        zIndex: 1,
        whiteSpace: "nowrap",
        display: "block",
        // @ts-ignore
        paintOrder: "stroke fill",
      }}
    >
      {text}
    </span>
  </div>
);

/* ─── Mobile FOMO Section — md:hidden ─────────────────── */
const MobileFomoSection = () => {
  const fillPct = Math.round((SEATS_FILLED / TOTAL_SEATS) * 100);
  return (
    <div
      className="md:hidden"
      style={{
        background: "#E8121A",
        borderTop: "4px solid #E8C12A",
        padding: "clamp(24px, 5vw, 40px) clamp(20px, 6vw, 40px)",
      }}
    >
      {/* Top row: number + meter */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
        {/* Big number */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "11px", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2px" }}>
            Already joined
          </div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "64px", color: "#fff", lineHeight: 1 }}>
            {SEATS_FILLED}
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "11px", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Founders
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "2px", height: "80px", background: "rgba(232,193,42,0.4)", flexShrink: 0 }} />

        {/* Meter */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "10px", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
            🔥 Price Going UP Soon
          </div>
          <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", marginBottom: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${fillPct}%`, background: "#E8C12A", borderRadius: "4px", transition: "width 1.2s ease-out" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "20px", color: "#fff" }}>{fillPct}%</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "10px", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.1em" }}>to next price</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "10px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "6px", lineHeight: 1.5 }}>
            The higher the bar,<br />the sooner price jumps 💀
          </div>
        </div>
      </div>
    </div>
  );
};

const TalkNTalesAbout = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .tnt-about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(32px, 5vw, 80px);
          align-items: start;
        }

        @media (min-width: 768px) {
          .tnt-about-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .tnt-stats {
          display: flex;
          gap: clamp(20px, 4vw, 40px);
          flex-wrap: wrap;
        }

        .tnt-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tnt-headline-block {
          margin-bottom: clamp(4px, 0.6vh, 8px);
        }

        .tnt-headline-last {
          margin-bottom: clamp(20px, 4vh, 40px);
        }

        .tnt-section {
          padding-left: clamp(16px, 5vw, 80px);
          padding-right: clamp(16px, 5vw, 80px);
          padding-top: clamp(40px, 6vh, 80px);
          padding-bottom: clamp(48px, 8vh, 96px);
        }

        .tnt-top-label {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: clamp(28px, 5vh, 52px);
        }

        .tnt-pull-quote {
          border-left: 5px solid #E8121A;
          padding-left: 20px;
          margin-bottom: clamp(18px, 3vh, 32px);
        }

        .tnt-body-p {
          margin-bottom: clamp(14px, 2vh, 24px);
        }

        .tnt-right-col {
          padding-top: 8px;
        }

        @media (max-width: 767px) {
          .tnt-right-col {
            padding-top: 0;
          }
          .tnt-about-grid > div:first-child > div {
            overflow: hidden;
          }
        }

        .tnt-stat-item {
          min-width: 0;
        }
      `}</style>

      {/* ── Mobile FOMO — only visible on mobile, sits right after About ── */}
      <MobileFomoSection />
      {/* ── About content ──────────────────────────────────── */}
      <div style={{ background: "#E8C12A", position: "relative", zIndex: 10 }}>
        <div className="tnt-section">

          {/* Top label */}
          <div className="tnt-top-label">
            <div
              style={{
                background: "#E8121A",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(9px, 1vw, 11px)",
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                padding: "5px 14px",
                flexShrink: 0,
              }}
            >
              About TnT
            </div>
            <div style={{ flex: 1, height: "2px", background: "rgba(0,0,0,0.15)" }} />
          </div>

          {/* Two column layout */}
          <div className="tnt-about-grid">

            {/* LEFT — headline + stats */}
            <div>
              <div className="tnt-headline-block">
                <LayeredWordAbout text="NOT A" color="#fff" shadowColor="#2B3EBF" />
              </div>
              <div className="tnt-headline-block">
                <LayeredWordAbout text="SEMINAR." color="#E8121A" shadowColor="#2B3EBF" />
              </div>
              <div className="tnt-headline-block">
                <LayeredWordAbout text="THIS IS" color="#fff" shadowColor="#2B3EBF" />
              </div>
              <div className="tnt-headline-last">
                <LayeredWordAbout text="NETWORKING." color="#E8121A" shadowColor="#2B3EBF" />
              </div>

              {/* Stats */}
              <div className="tnt-stats">
                {[
                  { num: "60+", label: "Founders" },
                  { num: "1", label: "Night" },
                  { num: "∞", label: "Connections" },
                ].map(({ num, label }) => (
                  <div key={label} className="tnt-stat-item">
                    <div
                      style={{
                        fontFamily: "'Alfa Slab One', serif",
                        fontSize: "clamp(26px, 4vw, 52px)",
                        color: "#2B3EBF",
                        lineHeight: 1,
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "clamp(9px, 0.9vw, 11px)",
                        color: "rgba(0,0,0,0.5)",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        marginTop: "4px",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — description */}
            <div className="tnt-right-col">
              <div className="tnt-pull-quote">
                <p
                  style={{
                    fontFamily: "'Shrikhand', serif",
                    fontSize: "clamp(16px, 2.2vw, 26px)",
                    color: "#2B3EBF",
                    lineHeight: 1.35,
                    letterSpacing: "0.02em",
                    margin: 0,
                  }}
                >
                  "A space for Gen-Z founders to connect and collaborate on what&apos;s real."
                </p>
              </div>

              <p
                className="tnt-body-p"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(13px, 1.3vw, 16px)",
                  color: "rgba(0,0,0,0.75)",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                Talk N Tales is an offline networking event exclusively for GenZ founders — those who are building startups, brands, projects, or anything they believe can change something.
              </p>

              <p
                className="tnt-body-p"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(13px, 1.3vw, 16px)",
                  color: "rgba(0,0,0,0.75)",
                  lineHeight: 1.8,
                  margin: 0,
                  marginBottom: "clamp(24px, 4vh, 40px)",
                }}
              >
                Here you&apos;ll meet people on the same frequency. Not to sit and listen — but to talk, share, and leave with connections that actually matter.
              </p>

              {/* Tags */}
              <div className="tnt-tags">
                {["Networking", "Pitch & Share", "GenZ Only", "IRL Only", "South Jakarta"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(9px, 0.9vw, 11px)",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      padding: "6px 14px",
                      border: "2px solid #2B3EBF",
                      color: "#2B3EBF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default TalkNTalesAbout;