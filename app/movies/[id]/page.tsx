import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import CommentSection from "./CommentSection";
import BackToGenres from "./BackToGenres";
import PosterImage from "./PosterImage";

interface Movie {
  _id: ObjectId;
  title: string;
  year?: number;
  genres?: string[];
  poster?: string;
  plot?: string;
  fullplot?: string;
  runtime?: number;
  director?: string;
  cast?: string[];
  countries?: string[];
  languages?: string[];
  released?: Date;
  imdb?: { rating?: number; votes?: number };
  type?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function MovieDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  let movie: Movie | null = null;

  try {
    movie = await db.collection<Movie>("movies").findOne({ _id: new ObjectId(id) });
  } catch (err) {
    console.error("Invalid ObjectId:", err);
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-muted text-lg">Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <BackToGenres />
          <a
            href="/"
            className="font-display font-bold text-xl tracking-tight text-foreground hover:text-accent transition-colors"
          >
            Reel
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-shrink-0">
            <PosterImage poster={movie.poster} title={movie.title} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              {movie.title}
            </h1>
            <p className="text-muted mb-6">
              Add a comment below. Comments are checked by AI before they’re saved.
            </p>

            <dl className="grid gap-3 text-sm">
              {movie.year && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Year</dt>
                  <dd className="text-foreground">{movie.year}</dd>
                </div>
              )}
              {movie.type && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Type</dt>
                  <dd className="text-foreground">{movie.type}</dd>
                </div>
              )}
              {movie.runtime && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Runtime</dt>
                  <dd className="text-foreground">{movie.runtime} min</dd>
                </div>
              )}
              {movie.director && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Director</dt>
                  <dd className="text-foreground">{movie.director}</dd>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Cast</dt>
                  <dd className="text-foreground">{movie.cast.join(", ")}</dd>
                </div>
              )}
              {movie.genres && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Genres</dt>
                  <dd className="text-foreground">{movie.genres.join(", ")}</dd>
                </div>
              )}
              {movie.countries && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Countries</dt>
                  <dd className="text-foreground">{movie.countries.join(", ")}</dd>
                </div>
              )}
              {movie.languages && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Languages</dt>
                  <dd className="text-foreground">{movie.languages.join(", ")}</dd>
                </div>
              )}
              {movie.released && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">Released</dt>
                  <dd className="text-foreground">{new Date(movie.released).toDateString()}</dd>
                </div>
              )}
              {movie.imdb?.rating != null && (
                <div className="flex gap-3">
                  <dt className="text-muted w-24 flex-shrink-0">IMDB</dt>
                  <dd className="text-foreground">
                    ⭐ {movie.imdb.rating.toFixed(1)}
                    {movie.imdb.votes != null && (
                      <span className="text-muted ml-2">({movie.imdb.votes.toLocaleString()} votes)</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {movie.plot && (
              <p className="mt-6 text-foreground leading-relaxed">{movie.plot}</p>
            )}
            {movie.fullplot && movie.fullplot !== movie.plot && (
              <p className="mt-4 text-muted text-sm leading-relaxed">{movie.fullplot}</p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-border">
          <CommentSection movieId={movie._id.toString()} />
        </div>
      </main>
    </div>
  );
}
