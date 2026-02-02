import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Filter } from "mongodb";
import type { ObjectId } from "mongodb";

interface MovieDoc {
  genres?: string[];
  year?: number;
  cast?: string[];
  languages?: string[];
  title?: string;
  poster?: string;
  imdb?: { rating?: number; votes?: number };
}

interface MovieWithComments extends MovieDoc {
  _id: ObjectId;
  commentCount: number;
}

const PAGE_SIZE = 20;

let indexesEnsured = false;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const genre = searchParams.get("genre");
  const yearFromParam = searchParams.get("yearFrom");
  const yearToParam = searchParams.get("yearTo");
  const actor = searchParams.get("actor");
  const language = searchParams.get("language");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!genre) {
    return NextResponse.json({ movies: [] });
  }

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  /* ---------------- Build filter: genre first, then year range, then others ---------------- */
  const filter: Filter<MovieDoc> = {
    genres: genre,
  };

  if (yearFromParam && yearToParam) {
    const yearFrom = parseInt(yearFromParam, 10);
    const yearTo = parseInt(yearToParam, 10);
    if (!Number.isNaN(yearFrom) && !Number.isNaN(yearTo) && yearFrom <= yearTo) {
      filter.year = { $gte: yearFrom, $lte: yearTo };
    }
  }

  if (actor) {
    filter.cast = { $regex: actor, $options: "i" };
  }

  if (language) {
    filter.languages = language;
  }

  /* ---------------- Ensure indexes once per process for fast $match and $lookup ---------------- */
  const moviesColl = db.collection<MovieDoc>("movies");
  if (!indexesEnsured) {
    indexesEnsured = true;
    await Promise.all([
      moviesColl.createIndex({ genres: 1, year: 1 }).catch(() => {}),
      db.collection("comments").createIndex({ movie_id: 1 }).catch(() => {}),
    ]);
  }

  /* ---------------- Aggregation: count-only $lookup (no comment docs loaded), then sort ---------------- */
  const movies = await moviesColl
    .aggregate<MovieWithComments>([
      { $match: filter },

      /* Count comments only; pipeline returns { count: N } instead of loading all comment docs */
      {
        $lookup: {
          from: "comments",
          let: { movieId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$movie_id", "$$movieId"] } } },
            { $count: "count" },
          ],
          as: "commentCountResult",
        },
      },
      {
        $addFields: {
          commentCount: {
            $ifNull: [{ $arrayElemAt: ["$commentCountResult.count", 0] }, 0],
          },
        },
      },

      { $sort: { commentCount: -1, year: -1 } },

      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE },

      {
        $project: {
          title: 1,
          poster: 1,
          imdb: 1,
          commentCount: 1,
        },
      },
    ])
    .toArray();

  return NextResponse.json({
    movies: movies.map(m => ({
      _id: m._id.toString(),
      title: m.title,
      poster: m.poster,
      imdb: m.imdb,
      commentCount: m.commentCount,
    })),
  });
}
