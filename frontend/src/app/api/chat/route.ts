import { NextRequest } from "next/server";
import { saveMessage, getMessages, getSession } from "@/lib/db";
import { retrieveContext } from "@/lib/rag";
import { generateChatStream, ChatMessage } from "@/lib/gemini";

// Force developer-friendly streaming responses
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, userId } = await req.json();

    if (!sessionId || !message || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sessionId, message, userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to user
    const session = await getSession(sessionId);
    if (!session || session.userId !== userId) {
      return new Response(
        JSON.stringify({ error: "Session not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Save user message to database
    await saveMessage(sessionId, "user", message);

    // 2. Retrieve relevant context from Knowledge Base (RAG)
    let retrievedSources: any[] = [];
    let contextString = "";

    try {
      const searchResults = await retrieveContext(message, 4, 0.60);
      
      if (searchResults.length > 0) {
        retrievedSources = searchResults.map((r, index) => ({
          id: index + 1,
          documentName: r.chunk.metadata.documentName,
          pageNumber: r.chunk.metadata.pageNumber,
          url: r.chunk.metadata.url,
          snippet: r.chunk.text,
        }));

        contextString = searchResults
          .map((r, idx) => `[Reference ${idx + 1}] Source: ${r.chunk.metadata.documentName}${r.chunk.metadata.sectionHeader ? `, Section: ${r.chunk.metadata.sectionHeader}` : ""}\n"${r.chunk.text}"`)
          .join("\n\n");
      }
    } catch (ragError) {
      console.error("RAG retrieval failed, falling back to general model knowledge:", ragError);
    }

    // 3. Fetch recent message history for context
    const dbMessages = await getMessages(sessionId);
    
    // Convert DB history to Gemini SDK format (exclude current message since startChat handles it)
    const history: ChatMessage[] = [];
    // Limit history length to last 6 messages to avoid token bloat
    const historyWindow = dbMessages.slice(-7, -1);
    
    for (const msg of historyWindow) {
      history.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // 4. Construct System Instruction with RAG Context
    const systemInstruction = `You are "GreenTech Advisor AI", a specialized production-ready conversational AI assistant. Your goal is to guide IT undergraduates in Sri Lankan state universities (and general users) toward environmentally responsible electronic device purchasing decisions and proper E-waste management.

CRITICAL INSTRUCTIONS:
- You are an advisory chatbot, NOT a survey tool. Do NOT ask research questionnaire questions.
- Maintain a professional, scientific, but simple and accessible tone.
- Use the "TRUSTED CONTEXT" below to answer the user's questions. 
- Explicitly cite the context sources by using bracketed annotations matching the reference index, e.g., [1] or [2] (matching the [Reference 1], [Reference 2] markers).
- If the TRUSTED CONTEXT does not contain sufficient information to answer the question, politely explain that you do not have enough specific data in your trusted documents to answer it. However, you can provide general environmental best practices while clearly stating that they do not come from the ingested study files.
- Avoid any hallucination. Do not generate fictional links, figures, or statistics.

TRUSTED CONTEXT AVAILABLE:
${contextString || "No specific reference documents found in the database. Rely on general sustainable electronics principles and advise the user accordingly, stating the lack of specific literature context."}
`;

    // 5. Initialize Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Enqueue sources first so the UI can render reference cards immediately
        controller.enqueue(
          encoder.encode(`event: sources\ndata: ${JSON.stringify(retrievedSources)}\n\n`)
        );

        let fullText = "";

        try {
          const apiStream = await generateChatStream(systemInstruction, history, message);

          for await (const chunk of apiStream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            
            // Format token event
            controller.enqueue(
              encoder.encode(`event: token\ndata: ${JSON.stringify({ text: chunkText })}\n\n`)
            );
          }

          // Save completed assistant response to history
          await saveMessage(sessionId, "assistant", fullText, retrievedSources);
          
          controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
        } catch (streamError: any) {
          console.error("Streaming error:", streamError);
          
          // Provide user-friendly fallback if GEMINI_API_KEY is not set or fails
          let fallbackText = "";
          if (streamError.message?.includes("GEMINI_API_KEY")) {
            fallbackText = "⚠️ **API Key Missing**: The `GEMINI_API_KEY` environment variable is not configured. Please add it to your `.env` file and run `npm run ingest` to initialize the database.";
          } else {
            fallbackText = "Sorry, I encountered an issue generating a response. Please check the backend logs.";
          }
          
          controller.enqueue(
            encoder.encode(`event: token\ndata: ${JSON.stringify({ text: fallbackText })}\n\n`)
          );
          await saveMessage(sessionId, "assistant", fallbackText, []);
          controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Error in POST /api/chat:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
