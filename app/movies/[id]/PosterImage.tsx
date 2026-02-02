"use client";

import { useState, useEffect } from "react";

type Props = {
  poster: string | null | undefined;
  title: string;
  className?: string;
};

export default function PosterImage({ poster, title, className = "" }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [poster]);

  const hasPoster =
    typeof poster === "string" &&
    poster.trim() !== "" &&
    poster !== "N/A";
  const showPlaceholder = !hasPoster || imageError;

  if (!showPlaceholder) {
    return (
      <img
        src={poster}
        alt={title}
        className={`w-full md:w-72 rounded-2xl shadow-2xl border border-border object-cover aspect-[2/3] ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`relative w-full md:w-72 aspect-[2/3] rounded-2xl flex items-center justify-center p-6 overflow-hidden border border-border shadow-2xl ${className}`}
      style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #ec4899 45%, #8b5cf6 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "linear-gradient(105deg, transparent 0%, transparent 35%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 55%, transparent 65%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      <span className="relative z-10 font-display font-bold text-white text-center text-lg uppercase tracking-wide drop-shadow-lg [text-shadow:0_0_20px_rgba(0,0,0,0.4)]">
        {title}
      </span>
    </div>
  );
}
