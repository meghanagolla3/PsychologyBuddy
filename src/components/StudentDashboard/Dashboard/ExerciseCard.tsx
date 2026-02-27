"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, Play } from "lucide-react";

/* --------------------------------------------------
   PHASE LABELS
-------------------------------------------------- */
const phaseLabels = {
  inhale: "Inhale...",
  hold: "Hold...",
  exhale: "Exhale...",
  idle: "Take a Breath",
} as const;

type Phase = keyof typeof phaseLabels;

export default function ExerciseCard() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [scale, setScale] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* --------------------------------------------------
     RUN ONE FULL 4–7–8 BREATHING CYCLE
  -------------------------------------------------- */
  const runCycle = () => {
    setPhase("inhale");
    setScale(1.18);

    timerRef.current = setTimeout(() => {
      setPhase("hold");
      timerRef.current = setTimeout(() => {
        setPhase("exhale");
        setScale(1);

        timerRef.current = setTimeout(() => {
          runCycle(); // Loop
        }, 8000);
      }, 7000);
    }, 4000);
  };

  /* --------------------------------------------------
     START / STOP
  -------------------------------------------------- */
  const handleStart = () => {
    const stop = () => {
      setIsBreathing(false);
      setPhase("idle");
      setScale(1);
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    if (isBreathing) return stop();

    setIsBreathing(true);
    runCycle();
  };

  /* --------------------------------------------------
     CLEANUP
  -------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div
      className="
        w-full max-w-[380px] 
        rounded-3xl p-7
        bg-gradient-to-br from-[#f3efff] via-[#ece6ff] to-[#f5f2ff]
        shadow-[0_4px_24px_rgba(120,80,220,0.10)]
        flex flex-col items-center 
        select-none
        backdrop-blur-xl
        border border-white/40
      "
    >
      {/* Header */}
      <div className="w-full flex items-center gap-2 mb-6">
        <Wind className="w-5 h-5 text-violet-700" />
        <span className="text-[15px] font-bold text-violet-800">
          Today’s Exercise: Deep Breathing
        </span>
      </div>

      {/* Breathing Visual */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center mb-6">
        {/* Outer Glow Ring */}
        <div
          className="
            absolute rounded-full bg-violet-400/20
            transition-transform
          "
          style={{
            width: 180,
            height: 180,
            transform: `scale(${isBreathing ? scale * 1.08 : 1})`,
            transitionDuration:
              phase === "inhale" ? "4000ms" : phase === "exhale" ? "8000ms" : "400ms",
          }}
        />

        {/* Mid Ring */}
        <div
          className="
            absolute rounded-full bg-violet-400/30
            transition-transform
          "
          style={{
            width: 148,
            height: 148,
            transform: `scale(${isBreathing ? scale * 1.05 : 1})`,
            transitionDuration:
              phase === "inhale" ? "4000ms" : phase === "exhale" ? "8000ms" : "400ms",
          }}
        />

        {/* Main Circle */}
        <div
          className="
            absolute rounded-full
            flex items-center justify-center text-white font-bold text-[14px]
            shadow-[0_8px_32px_rgba(139,92,246,0.45)]
            bg-gradient-to-br from-violet-500 via-indigo-400 to-sky-400
            z-10 transition-transform
          "
          style={{
            width: 118,
            height: 118,
            transform: `scale(${isBreathing ? scale : 1})`,
            transitionDuration:
              phase === "inhale" ? "4000ms" : phase === "exhale" ? "8000ms" : "400ms",
          }}
        >
          {phaseLabels[phase]}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[20px] font-extrabold text-violet-800 tracking-wide mb-1">
        4-7-8 Breathing
      </h2>

      {/* Subtitle */}
      <p className="text-[13px] text-violet-500 text-center mb-6">
        Follow the circle's rhythm. You're doing great.
      </p>

      {/* CTA Button */}
      <button
        onClick={handleStart}
        className="
          flex items-center gap-2
          bg-gradient-to-r from-violet-600 to-indigo-500
          text-white font-bold 
          rounded-xl px-10 py-3 text-[15px]
          shadow-[0_4px_16px_rgba(124,58,237,0.35)]
          transition active:scale-95 hover:opacity-90
        "
      >
        <Play className="w-4 h-4" />
        {isBreathing ? "Stop Breathing" : "Start Breathing"}
      </button>
    </div>
  );
}