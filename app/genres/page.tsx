"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GenreCount {
  genre: string;
  count: number;
}

interface Movie {
  _id: string;
  title: string;
  poster?: string;
}

interface Movie {
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

  // Fetch genres on mount
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
      const res = await fetch(`/api/movies?genre=${encodeURIComponent(selectedGenre)}&page=1`);
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
      const scrollableHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;

      if (currentScroll + 200 >= scrollableHeight) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedGenre, loading, hasMore, movies]);

  const loadMore = async () => {
    if (!selectedGenre) return;
    setLoading(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/movies?genre=${encodeURIComponent(selectedGenre)}&page=${nextPage}`);
    const data = await res.json();
    setMovies(prev => [...prev, ...data.movies]);
    setPage(nextPage);
    setHasMore(data.movies.length === limit);
    setLoading(false);
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Genres</h1>

      {/* Genre Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {genres.map(g => (
          <button
            key={g.genre}
            className={`px-4 py-2 rounded-full font-medium cursor-pointer ${
              selectedGenre === g.genre
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-green-400 hover:text-white"
            }`}
            onClick={() => setSelectedGenre(g.genre)}
          >
            {g.genre} ({g.count})
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {selectedGenre && (
        <>
          <h2 className="text-2xl font-bold mb-4">Movies in {selectedGenre}</h2>

          {movies.length === 0 && !loading ? (
            <p>No movies found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {movies.map(movie => (
                <Link
                key={movie._id}
                href={`/movies/${movie._id}`}
                className="relative border rounded overflow-hidden shadow-sm"
                >
                {/* Comment count pill */}
                {movie.commentCount > 0 && (
                    <div
                    className="
                        absolute top-2 right-2
                        bg-red-500 text-white
                        text-xs font-semibold
                        px-2 py-1
                        rounded-full
                        shadow
                        z-10
                    "
                    >
                    💬 {movie.commentCount}
                    </div>
                )}

                {/* Poster */}
                {movie.poster ? (
                    <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center p-2 text-center font-medium">
                    {movie.title}
                    </div>
                )}
                </Link>
              ))}
            </div>
          )}

          {loading && <p className="text-center mt-4">Loading...</p>}
          {!hasMore && movies.length > 0 && <p className="text-center mt-4">No more movies</p>}
        </>
      )}
    </main>
  );
}
