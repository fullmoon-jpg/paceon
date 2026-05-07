"use client";

import React from "react";

// ─── Placeholder SVG logos ────────────────────────────────────────────────────
// Ganti src di masing-masing <img> dengan path logo asli lo

const sponsors = {
  wasteManagement: [
    { name: "Nusabin", src: "/images/logo-nusabin.png" },
  ],
  supporting: [
    { name: "IQOS", src: "/images/logo-iqos.png" },
  ],
  official: [
    { name: "Mekari", src: "/images/mekari.png" },
    { name: "Bonteh", src: "/logos/bonteh.png" },
  ],
  media: [
    { name: "Media 1", src: "/images/karsa.png" },
    { name: "Media 2", src: "/images/Black-BG.jpg" },
    { name: "Media 3", src: "/images/mkpn.png" },
    { name: "Media 4", src: "/images/laundry.png" },
    { name: "Media 5", src: "/images/english.png" },
  ],
  community: [
    { name: "Teach First Indonesia", src: "/images/tfi.webp" },
    { name: "Bonteh Community", src: "/images/bonteh-community.jpeg" },
  ],
};

// ─── Logo Card ────────────────────────────────────────────────────────────────
interface LogoCardProps {
  name: string;
  src: string;
  size: "xl" | "lg" | "md" | "sm";
}

const SIZE_HEIGHT: Record<LogoCardProps["size"], number> = {
  xl: 80,
  lg: 64,
  md: 52,
  sm: 40,
};

function LogoCard({ name, src, size }: LogoCardProps) {
  const h = SIZE_HEIGHT[size];
  return (
    <div style={{ height: h, display: "flex", alignItems: "center" }}>
      <img
        src={src}
        alt={name}
        style={{ height: h, width: "auto", objectFit: "contain", display: "block" }}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = "none";
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <span
        style={{
          display: "none", height: h, alignItems: "center", justifyContent: "center",
          fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "0.75rem",
          letterSpacing: "0.05em", textTransform: "uppercase", color: "#0A0A0A",
        }}
        aria-hidden="true"
      >
        {name}
      </span>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{children}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SponsorSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;500;600&display=swap');

        /* ── Zohran palette (light mode) ─────────────── */
        :root {
          --z-red:    #D72B2B;
          --z-black:  #0A0A0A;
          --z-white:  #FFFFFF;
          --z-offwhite: #F7F7F7;
          --z-yellow: #F5C842;
          --z-border: #E0E0E0;
          --z-blue:   #1A4FA0;
        }

        /* ── Section wrapper ─────────────────────────── */
        .sponsor-section {
          background: var(--z-white);
          color: var(--z-black);
          padding: 80px 24px 96px;
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* decorative top stripe */
        .sponsor-section::before {
          content: '';
          display: block;
          height: 6px;
          background: var(--z-red);
          position: absolute;
          top: 0; left: 0; right: 0;
        }

        /* ── Heading ─────────────────────────────────── */
        .sponsor-heading {
          text-align: center;
          margin-bottom: 64px;
        }

        .sponsor-heading h2 {
          font-family: 'Alfa Slab One', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 400;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--z-black);
          line-height: 1.05;
          margin: 0;
        }

        .sponsor-heading h2 span {
          color: var(--z-red);
        }

        .sponsor-heading h2 .blue {
          color: var(--z-blue);
        }

        /* ── Grid layers ─────────────────────────────── */
        .sponsor-grid {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .sponsor-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .logos-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 24px;
        }

        /* ── Section label ────────────────────────────── */
        .section-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-label::before,
        .section-label::after {
          content: '';
          display: block;
          height: 1px;
          width: 40px;
          background: var(--z-red);
          opacity: 0.4;
        }

        .section-label span {
          font-family: 'Poppins', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--z-red);
          white-space: nowrap;
        }

        /* ── Divider ─────────────────────────────────── */
        .sponsor-divider {
          width: 100%;
          max-width: 600px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--z-border), transparent);
          margin: 0 auto;
        }

        /* logo sizing handled via inline style on img — height fixed per tier */
      `}</style>

      <section className="sponsor-section">
        <div className="sponsor-heading">
          <h2>
            <span className="blue">Our</span> <span>Collaborators</span>
            <br /><span className="blue">& Partners</span>
          </h2>
        </div>

        <div className="sponsor-grid">

          {/* ── Waste Management Partner ──────────────── */}
          <div className="sponsor-row">
            <SectionLabel>Waste Management Partner</SectionLabel>
            <div className="logos-row">
              {sponsors.wasteManagement.map((s) => (
                <LogoCard key={s.name} name={s.name} src={s.src} size="xl" />
              ))}
            </div>
          </div>

          <div className="sponsor-divider" />

          {/* ── Supporting Partner ────────────────────── */}
          <div className="sponsor-row">
            <SectionLabel>Supporting Partner</SectionLabel>
            <div className="logos-row">
              {sponsors.supporting.map((s) => (
                <LogoCard key={s.name} name={s.name} src={s.src} size="xl" />
              ))}
            </div>
          </div>

          <div className="sponsor-divider" />

          {/* ── Official Sponsor ──────────────────────── */}
          <div className="sponsor-row">
            <SectionLabel>Official Sponsor</SectionLabel>
            <div className="logos-row">
              {sponsors.official.map((s) => (
                <LogoCard key={s.name} name={s.name} src={s.src} size="lg" />
              ))}
            </div>
          </div>

          <div className="sponsor-divider" />

          {/* ── Media Partner ─────────────────────────── */}
          <div className="sponsor-row">
            <SectionLabel>Media Partner</SectionLabel>
            <div className="logos-row">
              {sponsors.media.map((s) => (
                <LogoCard key={s.name} name={s.name} src={s.src} size="sm" />
              ))}
            </div>
          </div>

          <div className="sponsor-divider" />

          {/* ── Community Partner ─────────────────────── */}
          <div className="sponsor-row">
            <SectionLabel>Community Partner</SectionLabel>
            <div className="logos-row">
              {sponsors.community.map((s) => (
                <LogoCard key={s.name} name={s.name} src={s.src} size="md" />
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}