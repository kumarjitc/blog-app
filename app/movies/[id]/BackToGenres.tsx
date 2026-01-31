"use client";

import { useRouter } from "next/navigation";

export default function BackToGenres() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/genres")}
      className="
        inline-flex items-center gap-2
        mb-6
        px-4 py-2
        rounded-full
        bg-white
        text-gray-700
        border border-gray-300
        shadow-sm
        hover:bg-green-500
        hover:text-white
        hover:border-green-500
        transition-all
        duration-200
      "
    >
      <span className="text-lg">←</span>
      <span className="font-medium">Back to Genres</span>
    </button>
  );
}
