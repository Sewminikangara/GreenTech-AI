import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { getEmbedding } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "knowledge_base");
const OUTPUT_FILE = path.join(process.cwd(), "data", "knowledge.json");

// Helper to chunk text
function chunkText(text: string, maxChars: number = 800, overlap: number = 150): string[] {
  const chunks: string[] = [];
  const cleanedText = text.replace(/\r\n/g, "\n");
  let currentStart = 0;
  
  while (currentStart < cleanedText.length) {
    let currentEnd = currentStart + maxChars;
    if (currentEnd >= cleanedText.length) {
      chunks.push(cleanedText.substring(currentStart).trim());
      break;
    }
    
    let breakPoint = currentEnd;
    const searchRange = cleanedText.substring(currentStart, currentEnd);
    const lastDoubleNew = searchRange.lastIndexOf("\n\n");
    if (lastDoubleNew > maxChars * 0.6) {
      breakPoint = currentStart + lastDoubleNew;
    } else {
      const lastSingleNew = searchRange.lastIndexOf("\n");
      if (lastSingleNew > maxChars * 0.7) {
        breakPoint = currentStart + lastSingleNew;
      } else {
        const lastSpace = searchRange.lastIndexOf(" ");
        if (lastSpace > maxChars * 0.8) {
          breakPoint = currentStart + lastSpace;
        }
      }
    }
    
    const chunk = cleanedText.substring(currentStart, breakPoint).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    currentStart = breakPoint - overlap;
    if (currentStart >= breakPoint) currentStart = breakPoint;
  }
  return chunks.filter((c) => c.length > 10);
}

export async function POST(req: NextRequest) {
  try {
    console.log("API Ingestion triggered...");
    
    if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
      fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
      return new Response(JSON.stringify({ success: true, message: "Created knowledge base directory, no files found.", chunkCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const files = await fs.promises.readdir(KNOWLEDGE_BASE_DIR);
    const targetFiles = files.filter((f) => f.endsWith(".txt") || f.endsWith(".md"));

    if (targetFiles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No text or markdown files found.", chunkCount: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allChunks: any[] = [];
    const isMockMode = !process.env.GEMINI_API_KEY;

    for (const fileName of targetFiles) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
      const content = await fs.promises.readFile(filePath, "utf-8");
      
      let category = "General";
      if (fileName.toLowerCase().includes("ewaste") || fileName.toLowerCase().includes("recycling")) {
        category = "E-Waste & Recycling";
      } else if (fileName.toLowerCase().includes("research") || fileName.toLowerCase().includes("survey")) {
        category = "Academic Research";
      } else if (fileName.toLowerCase().includes("sustainable") || fileName.toLowerCase().includes("laptops")) {
        category = "Sustainable Devices";
      }

      const textChunks = chunkText(content);
      
      for (let i = 0; i < textChunks.length; i++) {
        const text = textChunks[i];
        
        try {
          // getEmbedding handles mock/live logic seamlessly
          const embedding = await getEmbedding(text);
          const headerMatch = text.match(/^#+\s+(.+)$/m);
          const sectionHeader = headerMatch ? headerMatch[1] : undefined;

          allChunks.push({
            id: `${fileName}-chunk-${i}`,
            text,
            embedding,
            metadata: {
              documentName: fileName,
              category,
              sectionHeader,
            },
          });
          
          // Delay briefly to avoid hitting standard API limits in loop
          if (!isMockMode) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } catch (embeddingError) {
          console.error(`Error embedding chunk ${i} of ${fileName}:`, embeddingError);
          // Return failure only if live indexing fails critically, ignore mock flaws
          if (!isMockMode) {
            throw new Error(`Embedding generation failed for ${fileName} chunk ${i}: ${embeddingError}`);
          }
        }
      }
    }

    // Ensure output directories exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save vector store index
    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify({ chunks: allChunks }, null, 2), "utf-8");
    console.log(`Dynamic Ingestion Complete. Indexed ${allChunks.length} chunks.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully re-indexed knowledge base. Ingested ${allChunks.length} total chunks from ${targetFiles.length} files.`,
        chunkCount: allChunks.length,
        mode: isMockMode ? "offline" : "live",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in POST /api/documents/ingest:", error);
    return new Response(JSON.stringify({ error: "Ingestion failed: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
