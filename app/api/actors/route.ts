// /app/api/actors/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("query") || "";
  if (!q) return NextResponse.json({ actors: [] });

  const client = await clientPromise;
  const db = client.db("sample_mflix");

  const actors = await db
    .collection("movies")
    .distinct("cast", { cast: { $regex: q, $options: "i" } });

  return NextResponse.json({ actors: actors.slice(0, 10) }); // top 10 suggestions
}
