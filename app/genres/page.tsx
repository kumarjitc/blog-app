"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import MoviePoster from "./MoviePoster";

interface GenreCount {
  genre: string;
  count: number;
}

interface Movie {
  imdb?: { rating?: number; votes?: number };
  _id: string;
  title: string;
  poster?: string;
  commentCount: number;
}

export default function GenresPage() {
  const [genres, setGenres] = useState<GenreCount[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  /** 5-year range: "" = all, "2020" = 2020-2024, "2015" = 2015-2019, etc. */
  const [yearRange, setYearRange] = useState("");

  const [actor, setActor] = useState("");
  const [actorSuggestions, setActorSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [language, setLanguage] = useState("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = yearRange
      ? `/api/genres?yearFrom=${yearRange}&yearTo=${Number(yearRange) + 4}`
      : "/api/genres";
    fetch(url)
      .then(res => res.json())
      .then(setGenres);
  }, [yearRange]);

  useEffect(() => {
    if (!selectedGenre) return;
    setMovies([]);
    setPage(1);
    setHasMore(true);
    loadMovies(1, true);
  }, [selectedGenre, yearRange, actor, language]);

  useEffect(() => {
    const handleScroll = () => {
      if (!selectedGenre || loading || !hasMore) return;
      const bottomReached =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;
      if (bottomReached) loadMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedGenre, loading, hasMore, page]);

  useEffect(() => {
    if (!actor) return setActorSuggestions([]);
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/actors?query=${encodeURIComponent(actor)}`);
      const data = await res.json();
      setActorSuggestions(data.actors || []);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [actor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildQuery = (pageNum: number) => {
    const params = new URLSearchParams({
      genre: selectedGenre!,
      page: pageNum.toString(),
    });
    if (yearRange) {
      params.append("yearFrom", yearRange);
      params.append("yearTo", String(Number(yearRange) + 4));
    }
    if (actor) params.append("actor", actor);
    if (language) params.append("language", language);
    return `/api/movies?${params.toString()}`;
  };

  const loadMovies = async (pageNum: number, reset = false) => {
    setLoading(true);
    const res = await fetch(buildQuery(pageNum));
    const data = await res.json();
    setMovies(prev => (reset ? data.movies : [...prev, ...data.movies]));
    setHasMore(data.movies.length === limit);
    setPage(pageNum + 1);
    setLoading(false);
  };

  const loadMore = () => loadMovies(page);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-bold text-xl tracking-tight text-foreground hover:text-accent transition-colors"
          >
            Reel
          </Link>
          <nav className="flex items-center gap-6">
            <span className="text-sm font-medium text-accent">Browse</span>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            Search &amp; Review
          </h1>
          <p className="text-muted max-w-2xl">
            Choose a genre, then click a poster to see details and add comments. Comments are checked by AI before they’re saved.
          </p>
        </div>

        {/* 1. 5-year range filter (also filters genre counts) */}
        <p className="font-display font-semibold text-foreground mb-2">Year range</p>
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={yearRange}
            onChange={e => setYearRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition min-w-[10rem]"
          >
            <option value="">All years</option>
            {Array.from({ length: 20 }, (_, i) => 2020 - i * 5).map(start => (
              <option key={start} value={start}>
                {start}–{start + 4}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Genre filter */}
        <p className="font-display font-semibold text-foreground mb-4">Genre</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map(g => (
            <button
              key={g.genre}
              onClick={() => {
                setSelectedGenre(g.genre);
                setActor("");
                setLanguage("");
              }}
              className={`
                px-4 py-2 rounded-full font-medium text-sm transition-all
                ${selectedGenre === g.genre
                  ? "bg-accent text-black shadow-lg shadow-accent/25"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground border border-border"
                }
              `}
            >
              {g.genre}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${selectedGenre === g.genre ? "bg-black/20" : "bg-accent/20 text-accent"}`}>
                {g.count}
              </span>
            </button>
          ))}
        </div>

        {selectedGenre && (
          <div className="flex flex-wrap gap-4 mb-8 relative" ref={suggestionRef}>
            <div className="w-56 relative">
              <input
                type="text"
                placeholder="Filter by actor"
                value={actor}
                onChange={e => setActor(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
              />
              {showSuggestions && actorSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 py-1 rounded-xl bg-card border border-border shadow-xl max-h-48 overflow-y-auto z-50">
                  {actorSuggestions.map(a => (
                    <li
                      key={a}
                      className="px-4 py-2.5 cursor-pointer text-foreground hover:bg-accent-muted transition"
                      onClick={() => {
                        setActor(a);
                        setShowSuggestions(false);
                      }}
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
            >
              <option value="">All languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
        )}

        {selectedGenre && (
          <>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              {selectedGenre}
            </h2>

            {movies.length === 0 && !loading ? (
              <p className="text-muted py-12">No movies found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {movies.map(movie => (
                  <Link
                    key={movie._id}
                    href={`/movies/${movie._id}`}
                    className="relative group"
                  >
                    {movie.commentCount > 0 && (
                      <span className="absolute top-2 right-2 z-20 px-2 py-1 rounded-full bg-accent text-black text-xs font-semibold shadow">
                        💬 {movie.commentCount}
                      </span>
                    )}
                    <MoviePoster
                      title={movie.title}
                      poster={movie.poster}
                      genre={selectedGenre}
                      rating={movie.imdb?.rating}
                    />
                  </Link>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <div
                  className="h-10 w-10 rounded-full border-2 border-border border-t-accent animate-spin"
                  aria-label="Loading more movies"
                />
              </div>
            )}

            {!hasMore && movies.length > 0 && (
              <p className="text-center py-12 text-muted">No more movies</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
