"use client";

import Link from "next/link";

export default function BackToGenres() {
  return (
    <Link
      href="/genres"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-muted hover:text-foreground border border-border hover:border-accent/50 hover:bg-accent-muted transition-all"
    >
      <span className="text-lg" aria-hidden>←</span>
      <span>Back to genres</span>
    </Link>
  );
}
