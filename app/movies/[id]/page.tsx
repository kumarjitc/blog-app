import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import CommentSection from "./CommentSection"; // client component
import BackToGenres from "./BackToGenres";

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
    movie = await db.collection("movies").findOne({ _id: new ObjectId(id) });
  } catch (err) {
    console.error("Invalid ObjectId:", err);
  }

  if (!movie) return <p className="p-8">Movie not found</p>;

  return (
    <main className="p-8">
        <BackToGenres /> {/* ← Added back button */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster */}
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full md:w-64 h-auto object-cover rounded"
          />
        ) : (
          <div className="w-full md:w-64 h-64 bg-gray-200 flex items-center justify-center rounded text-gray-800 font-bold">
            {movie.title}
          </div>
        )}

        {/* Movie Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          {movie.year && <p><strong>Year:</strong> {movie.year}</p>}
          {movie.type && <p><strong>Type:</strong> {movie.type}</p>}
          {movie.runtime && <p><strong>Runtime:</strong> {movie.runtime} min</p>}
          {movie.director && <p><strong>Director:</strong> {movie.director}</p>}
          {movie.cast && movie.cast.length > 0 && <p><strong>Cast:</strong> {movie.cast.join(", ")}</p>}
          {movie.genres && <p><strong>Genres:</strong> {movie.genres.join(", ")}</p>}
          {movie.countries && <p><strong>Countries:</strong> {movie.countries.join(", ")}</p>}
          {movie.languages && <p><strong>Languages:</strong> {movie.languages.join(", ")}</p>}
          {movie.released && <p><strong>Released:</strong> {new Date(movie.released).toDateString()}</p>}
          {movie.imdb?.rating && <p><strong>IMDB Rating:</strong> {movie.imdb.rating}</p>}
          {movie.imdb?.votes && <p><strong>IMDB Votes:</strong> {movie.imdb.votes}</p>}
          {movie.plot && <p className="mt-4"><strong>Plot:</strong> {movie.plot}</p>}
          {movie.fullplot && <p className="mt-2"><strong>Full Plot:</strong> {movie.fullplot}</p>}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection movieId={movie._id.toString()} />
      </div>
    </main>
  );
}
