import fs from "fs";
import path from "path";
import { getEmbedding } from "./gemini";

export interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    documentName: string;
    pageNumber?: number;
    url?: string;
    category: string;
    sectionHeader?: string;
  };
}

export interface SearchResult {
  chunk: Omit<DocumentChunk, "embedding">;
  similarity: number;
}

const KNOWLEDGE_FILE_PATH = path.join(process.cwd(), "data", "knowledge.json");

/**
 * Helper to compute the dot product of two vectors.
 * Since text-embedding-004 vectors are unit normalized,
 * the dot product is equal to the cosine similarity.
 */
function dotProduct(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
  }
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

/**
 * Loads the knowledge base from data/knowledge.json.
 * If the file doesn't exist, returns an empty list of chunks.
 */
export async function loadKnowledgeBase(): Promise<DocumentChunk[]> {
  try {
    if (!fs.existsSync(KNOWLEDGE_FILE_PATH)) {
      return [];
    }
    const fileData = await fs.promises.readFile(KNOWLEDGE_FILE_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    return parsed.chunks || [];
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    return [];
  }
}

/**
 * Performs similarity search against the local vector database.
 * Returns the top K results above the similarity threshold.
 */
export async function retrieveContext(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.60
): Promise<SearchResult[]> {
  const queryEmbedding = await getEmbedding(query);
  const chunks = await loadKnowledgeBase();

  if (chunks.length === 0) {
    return [];
  }

  // Detect offline mock mode (no API key in env)
  const isMockMode = !process.env.GEMINI_API_KEY;

  if (isMockMode) {
    // Perform simple word-overlap token matching for mock mode to retrieve actual contents
    const queryWords = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3); // match substantial words only
      
    const results: SearchResult[] = chunks.map((chunk) => {
      const chunkTextLower = chunk.text.toLowerCase();
      let matches = 0;
      queryWords.forEach((word) => {
        if (chunkTextLower.includes(word)) {
          matches++;
        }
      });
      // Word overlap ratio as similarity metric
      const similarity = queryWords.length > 0 ? matches / queryWords.length : 0;
      const { embedding, ...chunkWithoutEmbedding } = chunk;
      
      return {
        chunk: chunkWithoutEmbedding,
        similarity,
      };
    });

    // In mock mode, filter chunks that match at least 15% of substantial words
    return results
      .filter((r) => r.similarity >= 0.15)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Real dense vector search using dot product (cosine similarity)
  const results: SearchResult[] = chunks.map((chunk) => {
    const similarity = dotProduct(queryEmbedding, chunk.embedding);
    const { embedding, ...chunkWithoutEmbedding } = chunk;
    return {
      chunk: chunkWithoutEmbedding,
      similarity,
    };
  });

  return results
    .filter((r) => r.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
