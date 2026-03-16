"use client";
import React from "react";
import { useRouter } from "next/navigation";

const TalkNTalesCTA = () => {
  const router = useRouter();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap"
        rel="stylesheet"
      />

      <section
        style={{ background: "#f7e6d4", width: "100%" }}
        className="px-4 md:px-10 lg:px-20 py-16 md:py-24"
      >
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>

          {/* Eyebrow */}
          <div
            style={{
              display: "inline-block",
              background: "#E8121A",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(9px, 1vw, 11px)",
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "5px 14px",
              marginBottom: "28px",
              transform: "rotate(-1deg)",
            }}
          >
            9 May 2026 · South Jakarta
          </div>

          {/* All-in-one SVG: arc top + content via foreignObject + arc bottom */}
          <svg
            viewBox="0 0 800 520"
            width="100%"
            style={{ display: "block", overflow: "visible", margin: "0 auto" }}
          >
            <defs>
              {/* Subtle arc up — large radius = gentle curve */}
              <path id="arcTop" d="M 60,170 A 700,700 0 0,1 740,170" />
              {/* Subtle arc down */}
              <path id="arcBot" d="M 60,350 A 700,700 0 0,0 740,350" />
            </defs>

            {/* ARE YOU IN? — top arc shadow */}
            <text
              aria-hidden="true"
              fontFamily="'Alfa Slab One', serif"
              fontSize="88"
              textAnchor="middle"
              fill="#E8C12A"
              stroke="#E8C12A"
              strokeWidth="6"
              letterSpacing="3"
              transform="translate(4,5)"
            >
              <textPath href="#arcTop" startOffset="50%">ARE YOU IN?</textPath>
            </text>
            {/* ARE YOU IN? — top arc main */}
            <text
              fontFamily="'Alfa Slab One', serif"
              fontSize="88"
              textAnchor="middle"
              fill="#2B3EBF"
              stroke="#fff"
              strokeWidth="4"
              paintOrder="stroke fill"
              letterSpacing="3"
            >
              <textPath href="#arcTop" startOffset="50%">ARE YOU IN?</textPath>
            </text>

            {/* WE ARE READY. — bottom arc shadow */}
            <text
              aria-hidden="true"
              fontFamily="'Alfa Slab One', serif"
              fontSize="80"
              textAnchor="middle"
              fill="#E8C12A"
              stroke="#E8C12A"
              strokeWidth="6"
              letterSpacing="3"
              transform="translate(4,5)"
            >
              <textPath href="#arcBot" startOffset="52%">WE ARE READY.</textPath>
            </text>
            {/* WE ARE READY. — bottom arc main */}
            <text
              fontFamily="'Alfa Slab One', serif"
              fontSize="80"
              textAnchor="middle"
              fill="#E8121A"
              stroke="#fff"
              strokeWidth="4"
              paintOrder="stroke fill"
              letterSpacing="3"
            >
              <textPath href="#arcBot" startOffset="52%">WE ARE READY.</textPath>
            </text>

            {/* Center content via foreignObject */}
            <foreignObject x="140" y="185" width="520" height="160">
              <div
                // @ts-ignore
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                    color: "rgba(0,0,0,0.6)",
                    lineHeight: 1.65,
                    margin: 0,
                    maxWidth: "340px",
                  }}
                >
                  Limited & curated. Exclusively for GenZ founders. Register now before spots run out.
                </p>

                <button
                  onClick={() => router.push("/Talk-n-Tales/registrationform")}
                  style={{
                    fontFamily: "'Alfa Slab One', serif",
                    fontSize: "15px",
                    background: "#2B3EBF",
                    color: "#E8C12A",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    border: "3px solid #2B3EBF",
                    padding: "10px 32px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "transparent";
                    el.style.color = "#2B3EBF";
                    el.style.transform = "translate(-3px,-3px)";
                    el.style.boxShadow = "6px 6px 0px #2B3EBF";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "#2B3EBF";
                    el.style.color = "#E8C12A";
                    el.style.transform = "translate(0,0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  Register Now →
                </button>
              </div>
            </foreignObject>
          </svg>

          {/* Price + deadline below SVG */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#2B3EBF",
                padding: "9px 18px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  fontSize: "clamp(14px, 1.8vw, 20px)",
                  color: "#E8C12A",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                IDR 199K
              </span>
              <div style={{ width: "2px", height: "18px", background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(8px, 0.85vw, 10px)",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  lineHeight: 1.4,
                  textAlign: "left",
                }}
              >
                GenZ Founders Only<br />Early Community Access
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(8px, 0.85vw, 10px)",
                color: "#E8121A",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                margin: 0,
              }}
            >
              ✦ Early price until 30 March 2026 ✦
            </p>
          </div>

        </div>
      </section>
    </>
  );
};

export default TalkNTalesCTA;