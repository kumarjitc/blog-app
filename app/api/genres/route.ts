import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface GenreAggregationResult {
  _id: string;
  count: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const yearFromParam = searchParams.get("yearFrom");
  const yearToParam = searchParams.get("yearTo");

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  const pipeline: object[] = [];

  if (yearFromParam && yearToParam) {
    const yearFrom = parseInt(yearFromParam, 10);
    const yearTo = parseInt(yearToParam, 10);
    if (!Number.isNaN(yearFrom) && !Number.isNaN(yearTo) && yearFrom <= yearTo) {
      pipeline.push({
        $match: { year: { $gte: yearFrom, $lte: yearTo } },
      });
    }
  }

  pipeline.push(
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }
  );

  const genres = await db
    .collection("movies")
    .aggregate<GenreAggregationResult>(pipeline)
    .toArray();

  return NextResponse.json(
    genres.map(g => ({
      genre: g._id,
      count: g.count,
    }))
  );
}
