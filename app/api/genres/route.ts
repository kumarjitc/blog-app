import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("sample_mflix");

  const genresWithCount = await db
    .collection("movies")
    .aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  return NextResponse.json(
    genresWithCount.map(g => ({ genre: g._id, count: g.count }))
  );
}
