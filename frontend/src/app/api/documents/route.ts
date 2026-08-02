import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { retrieveContext } from "@/lib/rag";

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "knowledge_base");

// Ensure the directory exists
function ensureDirExists() {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureDirExists();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const docName = searchParams.get("name");

    // 1. If a search query is provided, return matching chunks from the RAG engine
    if (query) {
      const searchResults = await retrieveContext(query, 10, 0.10);
      return new Response(JSON.stringify(searchResults), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. If a specific document name is provided, return its raw file content
    if (docName) {
      // Security check: prevent directory traversal
      const safeName = path.basename(docName);
      const filePath = path.join(KNOWLEDGE_BASE_DIR, safeName);
      if (!fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      const content = await fs.promises.readFile(filePath, "utf-8");
      return new Response(JSON.stringify({ content }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Otherwise, return the list of files in the knowledge base
    const files = await fs.promises.readdir(KNOWLEDGE_BASE_DIR);
    const textFiles = files.filter((f) => f.endsWith(".txt") || f.endsWith(".md"));

    const documentList = await Promise.all(
      textFiles.map(async (fileName) => {
        const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
        const stats = await fs.promises.stat(filePath);
        
        let category = "General";
        if (fileName.toLowerCase().includes("ewaste") || fileName.toLowerCase().includes("recycling")) {
          category = "E-Waste & Recycling";
        } else if (fileName.toLowerCase().includes("research") || fileName.toLowerCase().includes("survey")) {
          category = "Academic Research";
        } else if (fileName.toLowerCase().includes("sustainable") || fileName.toLowerCase().includes("laptops")) {
          category = "Sustainable Devices";
        }

        return {
          name: fileName,
          sizeBytes: stats.size,
          lastModified: stats.mtime.toISOString(),
          category,
        };
      })
    );

    return new Response(JSON.stringify(documentList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in GET /api/documents:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureDirExists();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file found in form data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Restrict files to text and markdown for security/parsing compatibility
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only .txt and .md files are supported." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save file
    const safeName = path.basename(file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(KNOWLEDGE_BASE_DIR, safeName);
    
    await fs.promises.writeFile(filePath, buffer);
    console.log(`Successfully uploaded file: ${safeName}`);

    return new Response(JSON.stringify({ success: true, fileName: safeName }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in POST /api/documents:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    ensureDirExists();
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("name");

    if (!fileName) {
      return new Response(JSON.stringify({ error: "Missing document name parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safeName = path.basename(fileName);
    const filePath = path.join(KNOWLEDGE_BASE_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await fs.promises.unlink(filePath);
    console.log(`Deleted document: ${safeName}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/documents:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
