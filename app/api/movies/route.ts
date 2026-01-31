import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const genre = searchParams.get("genre");
  const actor = searchParams.get("actor");
  const language = searchParams.get("language");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!genre) {
    return NextResponse.json({ movies: [] });
  }

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  /* ---------------- Build filter ---------------- */
  const filter: any = {
    genres: genre,
  };

  if (actor) {
    filter.cast = { $regex: actor, $options: "i" };
  }

  if (language) {
    filter.languages = language;
  }

  /* ---------------- Aggregation ---------------- */
  const movies = await db
    .collection("movies")
    .aggregate([
      { $match: filter },

      { $sort: { year: -1 } },

      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE },

      /* Join comments to count */
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "movie_id",
          as: "comments",
        },
      },

      {
        $project: {
          title: 1,
          poster: 1,
          imdb: 1,
          commentCount: { $size: "$comments" },
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
