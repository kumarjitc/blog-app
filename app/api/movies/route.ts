import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const genre = req.nextUrl.searchParams.get("genre");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  if (!genre) return NextResponse.json({ movies: [] });

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  const pipeline = [
    { $match: { genres: genre } },

    // Remove duplicates by poster/title
    {
      $group: {
        _id: { poster: "$poster", title: "$title" },
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },

    // Lookup comments
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "movie_id",
        as: "comments",
      },
    },

    // Add comment count
    {
      $addFields: {
        commentCount: { $size: "$comments" },
      },
    },

    { $project: { title: 1, poster: 1, commentCount: 1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const moviesRaw = await db.collection("movies").aggregate(pipeline).toArray();

  const movies = moviesRaw.map(m => ({
    _id: m._id.toString(),
    title: m.title,
    poster: m.poster,
    commentCount: m.commentCount ?? 0,
  }));

  return NextResponse.json({ movies });
}
