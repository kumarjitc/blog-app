type MoviePosterProps = {
  title: string;
  poster?: string | null;
  genre?: string;
  rating?: number;
};

const GENRE_COLORS: Record<string, string> = {
  Action: "bg-red-600",
  Drama: "bg-indigo-500",
  Comedy: "bg-yellow-400",
  Horror: "bg-purple-700",
  Romance: "bg-pink-500",
  Thriller: "bg-orange-600",
  SciFi: "bg-cyan-500",
  Fantasy: "bg-emerald-500",
};

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

  const genreColor =
    (genre && GENRE_COLORS[genre]) || "bg-red-600";

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
            text-yellow-400 text-xs font-bold
            px-2 py-1 rounded-full
          "
        >
          ⭐ {rating.toFixed(1)}
        </div>
      )}

      {/* 🎬 Poster or Title */}
      {hasPoster ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
        />
      ) : (
        <div
          className="
            w-full h-full flex flex-col items-center justify-center
            px-5 text-center
            bg-gradient-to-br from-zinc-950 via-zinc-900 to-black
          "
        >
          <div className={`w-14 h-1 ${genreColor} mb-4 rounded-full`} />

          <h3
            className="
              text-white text-xl font-extrabold uppercase
              tracking-widest leading-snug
              drop-shadow-lg line-clamp-4
            "
          >
            {title}
          </h3>

          <div className="w-20 h-[2px] bg-zinc-700 mt-4" />
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
