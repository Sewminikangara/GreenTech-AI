import { NextRequest } from "next/server";
import { getMessages, renameSession, deleteSession, getSession } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify session belongs to user
    const session = await getSession(id);
    if (!session || session.userId !== userId) {
      return new Response(JSON.stringify({ error: "Session not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = await getMessages(id);
    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error retrieving chat messages:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, userId } = await req.json();

    if (!title || !userId) {
      return new Response(JSON.stringify({ error: "Missing title or userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    const session = await getSession(id);
    if (!session || session.userId !== userId) {
      return new Response(JSON.stringify({ error: "Session not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = await renameSession(id, title);
    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to rename session" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error renaming session:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    const session = await getSession(id);
    if (!session || session.userId !== userId) {
      return new Response(JSON.stringify({ error: "Session not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = await deleteSession(id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to delete session" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
