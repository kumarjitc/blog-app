import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("sample_mflix");

  const genres = await db
    .collection("movies")
    .aggregate([
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  return NextResponse.json(
    genres.map(g => ({
      genre: g._id,
      count: g.count,
    }))
  );
}
