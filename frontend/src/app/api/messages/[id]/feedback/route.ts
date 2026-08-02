import { NextRequest } from "next/server";
import { saveFeedback } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rating, comment } = await req.json();

    if (!rating || (rating !== "like" && rating !== "dislike")) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing rating. Must be 'like' or 'dislike'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const success = await saveFeedback(id, rating, comment);
    if (!success) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error saving message feedback:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
