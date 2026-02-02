"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import MoviePoster from "./MoviePoster";

interface GenreCount {
  genre: string;
  count: number;
}

interface Movie {
  imdb: any;
  _id: string;
  title: string;
  poster?: string;
  commentCount: number;
}

export default function GenresPage() {
  const [genres, setGenres] = useState<GenreCount[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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

  /* ---------------- Fetch genres ---------------- */
  useEffect(() => {
    fetch("/api/genres")
      .then(res => res.json())
      .then(setGenres);
  }, []);

  /* ---------------- Fetch movies when filters change ---------------- */
  useEffect(() => {
    if (!selectedGenre) return;

    setMovies([]);
    setPage(1);
    setHasMore(true);

    loadMovies(1, true);
  }, [selectedGenre, actor, language]);

  /* ---------------- Infinite scroll ---------------- */
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

  /* ---------------- Actor Suggestions ---------------- */
  useEffect(() => {
    if (!actor) return setActorSuggestions([]);

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/actors?query=${encodeURIComponent(actor)}`);
      const data = await res.json();
      setActorSuggestions(data.actors || []);
      setShowSuggestions(true);
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [actor]);

  /* Close suggestions if clicked outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- API calls ---------------- */
  const buildQuery = (pageNum: number) => {
    const params = new URLSearchParams({
      genre: selectedGenre!,
      page: pageNum.toString(),
    });

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
    <main className="p-8">
      <h2 className="text-3xl font-bold mb-2">Search and Review Movies</h2>
      <h2 className="text-2xl font-bold mb-2">Click on any movie poster and add comments in the movie details page. Comments will be checked by AI and if the comment pass HuggingFace/TextModerator check it will be added to DB, else will be rejected</h2>
      <h3 className="text-xl font-semibold mb-6 text-gray-600">By Genres</h3>

      {/* ---------------- Genre Pills ---------------- */}
      <div className="flex flex-wrap gap-3 mb-6">
        {genres.map(g => (
          <button
            key={g.genre}
            onClick={() => {
              setSelectedGenre(g.genre);
              setActor("");
              setLanguage("");
            }}
            className={`px-4 py-2 rounded-full font-medium transition
              ${
                selectedGenre === g.genre
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-green-400 hover:text-white"
              }`}
          >
            {g.genre}
            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
              {g.count}
            </span>
          </button>
        ))}
      </div>

      {/* ---------------- Filters ---------------- */}
      {selectedGenre && (
        <div className="flex flex-wrap gap-4 mb-8 relative" ref={suggestionRef}>
          {/* Actor suggestion box */}
          <div className="w-64 relative">
            <input
              type="text"
              placeholder="Filter by actor"
              value={actor}
              onChange={e => setActor(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {showSuggestions && actorSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto z-50">
                {actorSuggestions.map(a => (
                  <li
                    key={a}
                    className="px-4 py-2 cursor-pointer hover:bg-green-100"
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

          {/* Language dropdown */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>
      )}

      {/* ---------------- Movies ---------------- */}
      {selectedGenre && (
        <>
          <h3 className="text-2xl font-bold mb-4">
            Movies in {selectedGenre}
          </h3>

          {movies.length === 0 && !loading ? (
            <p>No movies found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {movies.map(movie => (
                <Link
                  key={movie._id}
                  href={`/movies/${movie._id}`}
                  className="relative"
                >
                  {movie.commentCount > 0 && (
                    <span className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
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
            <p className="text-center mt-6 text-gray-500">Loading…</p>
          )}

          {!hasMore && movies.length > 0 && (
            <p className="text-center mt-6 text-gray-400">
              No more movies
            </p>
          )}
        </>
      )}
    </main>
  );
}
