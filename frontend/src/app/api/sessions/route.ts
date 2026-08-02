import { NextRequest } from "next/server";
import { createSession, getSessions } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessions = await getSessions(userId);
    return new Response(JSON.stringify(sessions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error listing sessions:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await createSession(userId, title);
    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating session:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
