import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getEmbedding } from "../src/lib/gemini";
import { DocumentChunk } from "../src/lib/rag";

// Load environment variables (useful for running via command line)
dotenv.config();

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "knowledge_base");
const OUTPUT_FILE = path.join(process.cwd(), "data", "knowledge.json");

// Helper to delay execution (rate limiting protection for Gemini API)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Splits text into overlapping chunks of a target size.
 * Tries to break at paragraph bounds (\n\n) or line bounds (\n) where possible.
 */
function chunkText(text: string, fileName: string, maxChars: number = 800, overlap: number = 150): string[] {
  const chunks: string[] = [];
  
  // Clean up carriage returns
  const cleanedText = text.replace(/\r\n/g, "\n");
  
  // If it's a markdown file, we can optionally split by markdown section headers
  // to preserve section structure. For simplicity, we use recursive character splitting.
  let currentStart = 0;
  
  while (currentStart < cleanedText.length) {
    let currentEnd = currentStart + maxChars;
    
    if (currentEnd >= cleanedText.length) {
      chunks.push(cleanedText.substring(currentStart).trim());
      break;
    }
    
    // Find a logical place to break the chunk
    let breakPoint = currentEnd;
    const searchRange = cleanedText.substring(currentStart, currentEnd);
    
    // Try finding double newline (paragraph boundary) near the end
    const lastDoubleNew = searchRange.lastIndexOf("\n\n");
    if (lastDoubleNew > maxChars * 0.6) {
      breakPoint = currentStart + lastDoubleNew;
    } else {
      // Try single newline
      const lastSingleNew = searchRange.lastIndexOf("\n");
      if (lastSingleNew > maxChars * 0.7) {
        breakPoint = currentStart + lastSingleNew;
      } else {
        // Try space
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
    
    // Move window start back by the overlap
    currentStart = breakPoint - overlap;
    
    // Prevent infinite loop in edge cases
    if (currentStart >= breakPoint) {
      currentStart = breakPoint;
    }
  }
  
  return chunks.filter(c => c.length > 10); // Skip tiny chunks
}

/**
 * Scans knowledge_base directory and processes txt/md files.
 */
async function runIngestion() {
  console.log("Starting Knowledge Base Ingestion...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn("--------------------------------------------------------------------------------");
    console.warn("WARNING: GEMINI_API_KEY is not defined.");
    console.warn("Building vector index in OFFLINE MOCK MODE using local deterministic embeddings.");
    console.warn("--------------------------------------------------------------------------------");
  }

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    console.log(`Creating knowledge_base directory at ${KNOWLEDGE_BASE_DIR}...`);
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
    
    // Seed with a dummy file if empty
    fs.writeFileSync(
      path.join(KNOWLEDGE_BASE_DIR, "README.md"),
      "# GreenTech Advisor AI Knowledge Base\nPlace your TXT or MD files here to ingest into the RAG system.\n",
      "utf-8"
    );
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);
  const targetFiles = files.filter(f => f.endsWith(".txt") || f.endsWith(".md"));
  
  if (targetFiles.length === 0) {
    console.log("No text (.txt) or markdown (.md) files found in knowledge_base/. Ingestion skipped.");
    return;
  }

  console.log(`Found ${targetFiles.length} files to process.`);
  const allChunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const fileName of targetFiles) {
    const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(`Processing file: ${fileName} (${content.length} characters)`);
    
    // Category mapping based on filename prefixes or default
    let category = "General";
    if (fileName.toLowerCase().includes("ewaste") || fileName.toLowerCase().includes("recycling")) {
      category = "E-Waste & Recycling";
    } else if (fileName.toLowerCase().includes("research") || fileName.toLowerCase().includes("survey")) {
      category = "Academic Research";
    } else if (fileName.toLowerCase().includes("laptops") || fileName.toLowerCase().includes("specs")) {
      category = "Sustainable Devices";
    }
    
    const textChunks = chunkText(content, fileName);
    console.log(`Split into ${textChunks.length} chunks.`);

    for (let i = 0; i < textChunks.length; i++) {
      const text = textChunks[i];
      console.log(`  └─ Embedding chunk ${i + 1}/${textChunks.length}...`);
      
      try {
        const embedding = await getEmbedding(text);
        
        // Find if there's a section header in the text (like ## Header Name)
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
          }
        });
        
        // Rate limiting gap: sleep 300ms between calls
        await delay(300);
      } catch (err: any) {
        console.error(`  ✕ Error embedding chunk ${i}: ${err.message}. Retrying in 2 seconds...`);
        await delay(2000);
        try {
          const embedding = await getEmbedding(text);
          allChunks.push({
            id: `${fileName}-chunk-${i}`,
            text,
            embedding,
            metadata: {
              documentName: fileName,
              category,
            }
          });
        } catch (retryErr: any) {
          console.error(`  ✕ Retry failed: ${retryErr.message}. Skipping chunk.`);
        }
      }
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save index
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ chunks: allChunks }, null, 2), "utf-8");
  console.log(`Successfully completed! Ingested ${allChunks.length} total chunks into ${OUTPUT_FILE}`);
}

runIngestion().catch(err => {
  console.error("Ingestion process failed:", err);
});
