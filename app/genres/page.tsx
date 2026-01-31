"use client";

import { useEffect, useState } from "react";
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;

  // Fetch genres
  useEffect(() => {
    fetch("/api/genres")
      .then(res => res.json())
      .then(setGenres);
  }, []);

  // Fetch movies when genre changes
  useEffect(() => {
    if (!selectedGenre) return;

    setMovies([]);
    setPage(1);
    setHasMore(true);

    const loadMovies = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/movies?genre=${encodeURIComponent(selectedGenre)}&page=1`
      );
      const data = await res.json();
      setMovies(data.movies);
      setHasMore(data.movies.length === limit);
      setLoading(false);
    };

    loadMovies();
  }, [selectedGenre]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!selectedGenre || loading || !hasMore) return;

      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (bottom) loadMore();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedGenre, loading, hasMore, page]);

  const loadMore = async () => {
    if (!selectedGenre) return;

    setLoading(true);
    const nextPage = page + 1;

    const res = await fetch(
      `/api/movies?genre=${encodeURIComponent(selectedGenre)}&page=${nextPage}`
    );
    const data = await res.json();

    setMovies(prev => [...prev, ...data.movies]);
    setPage(nextPage);
    setHasMore(data.movies.length === limit);
    setLoading(false);
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">Search and Review Movies</h1>
      <h2 className="text-xl font-semibold mb-6 text-gray-600">By Genres</h2>

      {/* Genre Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {genres.map(g => (
          <button
            key={g.genre}
            onClick={() => setSelectedGenre(g.genre)}
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

      {/* Movies */}
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
                  {/* Comment pill */}
                  {movie.commentCount > 0 && (
                    <span
                      className="absolute top-2 right-2 z-10
                                 bg-red-600 text-white text-xs
                                 px-2 py-1 rounded-full shadow"
                    >
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
