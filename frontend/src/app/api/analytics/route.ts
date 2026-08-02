import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

interface DatabaseSchema {
  sessions: any[];
  messages: any[];
}

export async function GET(req: NextRequest) {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      return new Response(
        JSON.stringify({
          totalSessions: 0,
          totalMessages: 0,
          avgMessagesPerSession: 0,
          likesCount: 0,
          dislikesCount: 0,
          dislikeLogs: [],
          popularKeywords: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const fileData = await fs.promises.readFile(DB_FILE_PATH, "utf-8");
    const db = JSON.parse(fileData) as DatabaseSchema;

    const totalSessions = db.sessions.length;
    const totalMessages = db.messages.length;
    
    // Average messages per session
    const avgMessagesPerSession =
      totalSessions > 0 ? parseFloat((totalMessages / totalSessions).toFixed(1)) : 0;

    // Feedback rating breakdown
    let likesCount = 0;
    let dislikesCount = 0;
    const dislikeLogs: any[] = [];

    db.messages.forEach((msg) => {
      if (msg.feedback) {
        if (msg.feedback.rating === "like") {
          likesCount++;
        } else if (msg.feedback.rating === "dislike") {
          dislikesCount++;
          
          // Trace user query preceding this unhelpful response
          const sessionMsgs = db.messages
            .filter((m) => m.sessionId === msg.sessionId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
          const msgIdx = sessionMsgs.findIndex((m) => m.id === msg.id);
          const precedingUserQuery = msgIdx > 0 ? sessionMsgs[msgIdx - 1].text : "N/A";

          dislikeLogs.push({
            id: msg.id,
            timestamp: msg.timestamp,
            query: precedingUserQuery,
            response: msg.text,
            comment: msg.feedback.comment || "No comment provided",
          });
        }
      }
    });

    // Simple keyword frequency analysis of user queries to see undergraduate concerns
    const wordFreq: Record<string, number> = {};
    const STOP_WORDS = new Set([
      "what", "how", "where", "when", "why", "who", "with", "this", "that", "your",
      "sri", "lanka", "safely", "recycle", "the", "and", "for", "you", "are", "buy"
    ]);

    db.messages
      .filter((m) => m.sender === "user")
      .forEach((msg) => {
        const words = msg.text
          .toLowerCase()
          .split(/\W+/)
          .filter((w: string) => w.length > 3 && !STOP_WORDS.has(w));
        
        words.forEach((w: string) => {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        });
      });

    const popularKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    return new Response(
      JSON.stringify({
        totalSessions,
        totalMessages,
        avgMessagesPerSession,
        likesCount,
        dislikesCount,
        dislikeLogs,
        popularKeywords,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating analytics metrics:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
