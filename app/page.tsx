import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Reel
          </span>
          <nav className="flex items-center gap-6">
            <Link
              href="/genres"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Browse
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Discover &amp; Review Movies
          </h1>
          <p className="text-lg text-muted mb-10 leading-relaxed">
            Pick a genre, explore films, and share your thoughts. Comments are
            checked by AI moderation before they’re posted.
          </p>
          <Link
            href="/genres"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-accent text-black hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            Browse by Genre
            <span className="text-lg" aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-3 gap-8 max-w-lg text-center text-muted text-sm">
          <div>
            <span className="block font-display font-semibold text-foreground text-base mb-1">Genres</span>
            Pick from Action, Drama, Comedy &amp; more
          </div>
          <div>
            <span className="block font-display font-semibold text-foreground text-base mb-1">Details</span>
            Posters, cast, plot &amp; IMDB ratings
          </div>
          <div>
            <span className="block font-display font-semibold text-foreground text-base mb-1">Comments</span>
            AI-moderated, so discussions stay civil
          </div>
        </div>
      </main>
    </div>
  );
}
