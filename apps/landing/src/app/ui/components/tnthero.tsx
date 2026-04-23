"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const NAVBAR_HEIGHT = "64px";
const EVENT_DATE = new Date("2026-05-09T19:00:00");

const marqueeItems = [
  "Talk N Tales ✦",
  "GenZ Founders ✦",
  "Offline Networking ✦",
  "Real Talks ✦",
  "Build Together ✦",
];

const LayeredWord = ({ text, size = "clamp(80px, 18vw, 160px)" }: { text: string; size?: string }) => (
  <span style={{ position: "relative", display: "inline-block", lineHeight: 0.88 }}>
    <span
      aria-hidden="true"
      style={{
        fontFamily: "'Alfa Slab One', serif",
        fontSize: size,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        color: "#E8C12A",
        WebkitTextStroke: "6px #E8C12A",
        position: "absolute",
        top: "6px",
        left: "6px",
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
        letterSpacing: "0.03em",
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
      {text}
    </span>
  </span>
);

const pad = (n: number) => String(n).padStart(2, "0");

const TOTAL_SEATS = 30;
const SEATS_FILLED = 20;

/* ─── FOMO Badge — desktop only (absolute in hero) */
const FomoBadgeContent = () => {
  const fillPct = Math.round((SEATS_FILLED / TOTAL_SEATS) * 100);
  return (
    <>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(9px, 1vw, 11px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "2px" }}>
        Already joined
      </div>
      <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(34px, 5vw, 54px)", color: "#fff", lineHeight: 1 }}>
        {SEATS_FILLED}
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(9px, 1vw, 11px)", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
        founders
      </div>
      <div style={{ width: "100%", height: "2px", background: "#E8C12A", margin: "6px 0" }} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.85vw, 10px)", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>
        Price Going UP Soon
      </div>
      <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", marginBottom: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${fillPct}%`, background: "#E8C12A", borderRadius: "4px", transition: "width 1.2s ease-out" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(13px, 1.6vw, 17px)", color: "#fff" }}>{fillPct}%</span>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.85vw, 10px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.1em" }}>to next price</span>
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.9vw, 10px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "8px", lineHeight: 1.4 }}>
        ⚑ the higher this bar,<br />the sooner price jumps 💀
      </div>
    </>
  );
};

const TalkNTalesHero = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const countdownUnit = (val: number, label: string) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(22px, 3.5vw, 42px)", color: "#fff", lineHeight: 1 }}>{pad(val)}</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(8px, 0.9vw, 11px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "4px" }}>{label}</div>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:wght@400;700;900&family=Shrikhand&display=swap" rel="stylesheet" />

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section
        className="w-full flex flex-col overflow-hidden"
        style={{ background: "#2B3EBF", height: `calc(100vh - ${NAVBAR_HEIGHT})` }}
      >
        {/* Marquee */}
        <div className="overflow-hidden whitespace-nowrap shrink-0" style={{ background: "#E8C12A", padding: "10px 0" }}>
          <div className="inline-flex" style={{ animation: "marquee 18s linear infinite" }}>
            {[0, 1].flatMap((si) =>
              marqueeItems.map((item) => (
                <span key={`${si}-${item}`} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(10px, 1.2vw, 13px)", color: "#2B3EBF", textTransform: "uppercase", letterSpacing: "0.18em", padding: "0 28px", whiteSpace: "nowrap" }}>
                  {item}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Hero body */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
          style={{ paddingTop: "clamp(8px, 1vh, 12px)", paddingBottom: "clamp(60px, 8vh, 80px)" }}
        >
          <h1 style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
            Talk N Tales — Offline Networking Event for GenZ Founders
          </h1>

          {/* Vol #2 Stamp */}
          <div className="absolute hidden md:flex flex-col items-center justify-center" style={{ left: "clamp(24px, 4vw, 56px)", top: "clamp(16px, 3vh, 32px)", transform: "rotate(-4deg)", background: "#2B3EBF", border: "4px solid #E8C12A", padding: "14px 18px", width: "clamp(80px, 9vw, 116px)" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.9vw, 11px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.2em", textAlign: "center", lineHeight: 1.3 }}>Vol.</span>
            <span style={{ fontFamily: "'Shrikhand', serif", fontSize: "clamp(36px, 5.5vw, 72px)", color: "#fff", lineHeight: 1, textAlign: "center" }}>#2</span>
            <div style={{ width: "100%", height: "2px", background: "#E8C12A", margin: "5px 0" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(7px, 0.8vw, 10px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", lineHeight: 1.4 }}>2026</span>
          </div>

          {/* TALK N TALES kecil — pojok kanan atas */}
          <div className="absolute hidden md:flex flex-col items-end" style={{ right: "clamp(24px, 4vw, 56px)", top: "clamp(16px, 3vh, 32px)", gap: "0px" }}>
            <LayeredWord text="TALK" size="clamp(14px, 2.2vw, 26px)" />
            <LayeredWord text="N TALES" size="clamp(14px, 2.2vw, 26px)" />
          </div>

          {/* IRL Stamp */}
          <div className="absolute hidden md:flex flex-col items-center justify-center" style={{ right: "clamp(24px, 4vw, 56px)", top: "50%", transform: "translateY(-60%) rotate(3deg)", background: "#E8121A", border: "4px solid #E8C12A", padding: "18px 20px", width: "clamp(90px, 10vw, 130px)", gap: "2px" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.9vw, 11px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.2em", textAlign: "center", lineHeight: 1.3 }}>Offline</span>
            <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(28px, 4vw, 52px)", color: "#fff", lineHeight: 1, textTransform: "uppercase", textAlign: "center" }}>IRL</span>
            <div style={{ width: "100%", height: "2px", background: "#E8C12A", margin: "4px 0" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(8px, 0.9vw, 11px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", lineHeight: 1.3 }}>Event</span>
            <span style={{ fontFamily: "'Shrikhand', serif", fontSize: "clamp(9px, 1vw, 13px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.4, marginTop: "2px" }}>GenZ<br />Founders</span>
          </div>

          {/* FOMO Badge — desktop only */}
          <div
            className="absolute hidden md:block"
            style={{
              left: "clamp(16px, 3.5vw, 48px)",
              bottom: "clamp(60px, 12vh, 90px)",
              zIndex: 10,
              background: "#E8121A",
              border: "4px solid #E8C12A",
              padding: "clamp(10px, 1.5vh, 14px) clamp(12px, 1.8vw, 18px)",
              width: "clamp(148px, 18vw, 196px)",
              transform: "rotate(-2deg)",
              boxShadow: "5px 5px 0px #E8C12A",
            }}
          >
            <FomoBadgeContent />
          </div>

          {/* Badge */}
          <div style={{ background: "#E8121A", fontFamily: "'Shrikhand', serif", fontSize: "clamp(11px, 1.4vw, 15px)", color: "#fff", letterSpacing: "0.08em", padding: "5px 16px", transform: "rotate(-1deg)", display: "inline-block", marginBottom: "clamp(6px, 1vh, 10px)" }}>
            Private Gathering for Gen-Z Founders
          </div>

          {/* Logo */}
          <div style={{ width: "clamp(320px, 60vw, 740px)", height: "clamp(160px, 22vw, 280px)", position: "relative", marginBottom: "clamp(8px, 1.5vh, 14px)" }}>
            <Image src="/images/logo-tnt2.png" alt="Talk N Tales #2 — Offline Networking Event for GenZ Founders" fill style={{ objectFit: "contain", objectPosition: "center center" }} priority />
          </div>

          {/* Connecting Vision */}
          <div style={{ marginBottom: "clamp(10px, 1.5vh, 18px)" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(11px, 1.6vw, 18px)", color: "#E8C12A", textTransform: "uppercase", letterSpacing: "0.25em" }}>
              — Connecting Vision —
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/Talk-n-Tales/registrationform")}
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "clamp(11px, 1.2vw, 14px)", background: "#E8C12A", color: "#2B3EBF", letterSpacing: "0.18em", textTransform: "uppercase", border: "3px solid #E8C12A", padding: "clamp(10px, 1.5vh, 16px) clamp(20px, 2.5vw, 36px)", cursor: "pointer", transition: "all 0.15s ease" }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "#E8C12A"; el.style.transform = "translate(-3px, -3px)"; el.style.boxShadow = "6px 6px 0px #E8C12A"; }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "#E8C12A"; el.style.color = "#2B3EBF"; el.style.transform = "translate(0, 0)"; el.style.boxShadow = "none"; }}
          >
            REGISTER NOW →
          </button>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between flex-wrap gap-4 px-6 md:px-10 lg:px-16" style={{ paddingBottom: "clamp(14px, 2.5vh, 24px)" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(16px, 2.5vw, 28px)", color: "#fff", lineHeight: 1.1, textTransform: "uppercase" }}>
                9 <span style={{ color: "#E8C12A" }}>•</span> Mei <span style={{ color: "#E8C12A" }}>•</span> 2026
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(10px, 1.2vw, 14px)", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "4px" }}>
                Mantra Space, Jakarta Selatan
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 24px)" }}>
              {countdownUnit(timeLeft.days, "Days")}
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(18px, 2.5vw, 32px)", color: "#E8C12A", lineHeight: 1, marginBottom: "16px" }}>.</span>
              {countdownUnit(timeLeft.hours, "Hours")}
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(18px, 2.5vw, 32px)", color: "#E8C12A", lineHeight: 1, marginBottom: "16px" }}>.</span>
              {countdownUnit(timeLeft.minutes, "Minutes")}
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(18px, 2.5vw, 32px)", color: "#E8C12A", lineHeight: 1, marginBottom: "16px" }}>.</span>
              {countdownUnit(timeLeft.seconds, "Seconds")}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="shrink-0 flex items-center justify-between flex-wrap gap-2 px-6 md:px-10 lg:px-16" style={{ background: "#E8121A", paddingTop: "12px", paddingBottom: "12px" }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(9px, 1vw, 12px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.2em" }}>Offline Networking Event</span>
          <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: "clamp(11px, 1.2vw, 15px)", color: "#E8C12A", textTransform: "uppercase" }}>Founder Only ✦</span>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
};

export default TalkNTalesHero;