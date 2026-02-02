"use client";

import { useState, useEffect } from "react";

type MoviePosterProps = {
  title: string;
  poster?: string | null;
  genre?: string;
  rating?: number;
};

const GENRE_COLORS: Record<string, string> = {
  Action: "bg-red-600",
  Drama: "bg-indigo-500",
  Comedy: "bg-amber-400",
  Horror: "bg-purple-700",
  Romance: "bg-pink-500",
  Thriller: "bg-orange-600",
  "Sci-Fi": "bg-cyan-500",
  Fantasy: "bg-emerald-500",
};

/** Vibrant gradient stops for no-poster placeholders (from, via, to) */
const GENRE_GRADIENTS: Record<string, [string, string, string]> = {
  Action: ["#dc2626", "#ea580c", "#b91c1c"],
  Drama: ["#6366f1", "#8b5cf6", "#4f46e5"],
  Comedy: ["#fbbf24", "#f59e0b", "#d97706"],
  Horror: ["#7c3aed", "#a855f7", "#6d28d9"],
  Romance: ["#ec4899", "#f472b6", "#db2777"],
  Thriller: ["#ea580c", "#f97316", "#c2410c"],
  "Sci-Fi": ["#06b6d4", "#22d3ee", "#0891b2"],
  Fantasy: ["#10b981", "#34d399", "#059669"],
};

const DEFAULT_GRADIENT: [string, string, string] = ["#f59e0b", "#ec4899", "#8b5cf6"];

export default function MoviePoster({
  title,
  poster,
  genre,
  rating,
}: MoviePosterProps) {
  const hasPoster =
    typeof poster === "string" &&
    poster.trim() !== "" &&
    poster !== "N/A";

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [poster]);

  const showPlaceholder = !hasPoster || imageError;

  const genreColor =
    (genre && GENRE_COLORS[genre]) || "bg-accent";

  const gradientStops =
    (genre && GENRE_GRADIENTS[genre]) || DEFAULT_GRADIENT;
  const [gFrom, gVia, gTo] = gradientStops;

  return (
    <div
      className="
        group relative w-full aspect-[2/3]
        rounded-2xl overflow-hidden
        bg-black shadow-xl
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl
      "
    >
      {/* 🎞 Film grain */}
      <div
        className="
          pointer-events-none absolute inset-0 z-10
          bg-[url('/grain.png')] opacity-[0.08]
        "
      />

      {/* ⭐ Rating badge */}
      {rating && (
        <div
          className="
            absolute top-3 left-3 z-20
            bg-black/70 backdrop-blur
            text-accent text-xs font-bold
            px-2 py-1 rounded-full
          "
        >
          ⭐ {rating.toFixed(1)}
        </div>
      )}

      {/* 🎬 Poster or Title */}
      {!showPlaceholder ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
        />
      ) : (
        <div
          className="relative w-full h-full flex flex-col items-center justify-center px-5 text-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gFrom} 0%, ${gVia} 45%, ${gTo} 100%)`,
          }}
        >
          {/* Shine overlay: diagonal highlight */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 0%,
                transparent 35%,
                rgba(255,255,255,0.35) 45%,
                rgba(255,255,255,0.5) 50%,
                rgba(255,255,255,0.35) 55%,
                transparent 65%,
                transparent 100%
              )`,
            }}
          />
          {/* Extra shimmer strip */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(
                180deg,
                rgba(255,255,255,0.25) 0%,
                transparent 30%,
                transparent 70%,
                rgba(0,0,0,0.2) 100%
              )`,
            }}
          />

          <div className={`relative z-10 w-14 h-1 mb-4 rounded-full bg-white/90 shadow-md`} />

          <h3
            className="
              relative z-10 text-white text-xl font-extrabold uppercase
              tracking-widest leading-snug
              drop-shadow-lg line-clamp-4
              [text-shadow:0_0_20px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.4)]
            "
          >
            {title}
          </h3>

          <div className="relative z-10 w-20 h-[2px] mt-4 rounded-full bg-white/60 shadow-sm" />
        </div>
      )}

      {/* 🌈 Genre accent bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${genreColor}`}
      />

      {/* 🎬 Hover glow */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-t from-black/60 via-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity
        "
      />
    </div>
  );
}
