import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Client } from "@gradio/client";
import { moderateText } from "@/lib/moderation";

export async function GET(req: NextRequest) {
  const movieId = req.nextUrl.searchParams.get("movieId");
  if (!movieId) return NextResponse.json({ comments: [] });

  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const comments = await db
      .collection("comments")
      .find({ movie_id: new ObjectId(movieId) })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({
      comments: comments.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        text: c.text,
        date: c.date.toISOString(),
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { movieId, name, text } = await req.json();

    if (!movieId || !text) {
      return NextResponse.json(
        { success: false, error: "Missing movieId or comment text" },
        { status: 400 }
      );
    }

    const guardrails = await Client.connect("duchaba/Friendly_Text_Moderation");
    const toxicity = await guardrails.predict("/fetch_toxicity_level", { 		
            msg: text, 		
            safer: 0.005, 
    });

    const moderationResult = moderateText(JSON.parse(toxicity.data[1].toString()));
    console.log("---------------", moderationResult);

    if (!moderationResult.isSafe) {
      return NextResponse.json(
        { success: false, error: moderationResult.message },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const newComment = {
      movie_id: new ObjectId(movieId),
      name: name || "Anonymous",
      text,
      date: new Date(),
    };

    const result = await db.collection("comments").insertOne(newComment);

    return NextResponse.json({
      success: true,
      comment: {
        _id: result.insertedId.toString(),
        name: newComment.name,
        text: newComment.text,
        date: newComment.date.toISOString(),
      },
    });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
