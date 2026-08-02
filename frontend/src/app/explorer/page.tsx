"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Clock,
  HardDrive,
  Home,
  MessageSquare,
  Calculator,
  Shield,
  ArrowLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface DocumentItem {
  name: string;
  sizeBytes: number;
  lastModified: string;
  category: string;
}

interface SearchChunkResult {
  chunk: {
    id: string;
    text: string;
    metadata: {
      documentName: string;
      category: string;
      sectionHeader?: string;
    };
  };
  similarity: number;
}

export default function KnowledgeExplorer() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>("");
  const [activeFileContent, setActiveFileContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchChunkResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0 && !activeFileName) {
          handleSelectFile(data[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = async (name: string) => {
    setActiveFileName(name);
    setSearchQuery(""); // Clear search when viewing document
    setSearchResults([]);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/documents?name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setActiveFileContent(data.content);
      }
    } catch (err) {
      console.error("Error fetching file content:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChunks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setActiveFileName(""); // Clear active file select
    setActiveFileContent("");
    
    try {
      const res = await fetch(`/api/documents?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Error searching vector chunks:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Render file size helper
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Convert raw text markdown for clean reading
  const renderDocumentMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h3 key={idx} style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "20px", marginBottom: "8px" }}>{line.substring(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: "24px", marginBottom: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>{line.substring(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={idx} style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "24px", marginBottom: "16px", color: "var(--primary)" }}>{line.substring(2)}</h1>;
      }
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        return <li key={idx} className="list-disc ml-6 mb-2">{formatBold(line.trim().substring(2))}</li>;
      }
      const numMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        return <li key={idx} className="list-decimal ml-6 mb-2">{formatBold(numMatch[2])}</li>;
      }
      return <p key={idx} style={{ marginBottom: "12px", lineHeight: "1.6" }}>{formatBold(line)}</p>;
    });
  };

  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Navbar Header */}
      <header className="top-header">
        <div className="header-left">
          <div className="brand" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
            <BookOpen size={20} style={{ color: "var(--primary)" }} />
            <span className="brand-title">Knowledge Explorer</span>
          </div>
        </div>
        
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="/" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Home size={14} /> Home
          </a>
          <a href="/chat" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageSquare size={14} /> Chat
          </a>
          <a href="/recommendations" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Calculator size={14} /> Calculator
          </a>
          <a href="/admin" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Shield size={14} /> Admin
          </a>
        </nav>
        
        <div className="header-right">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Active Files: {documents.length}
          </span>
        </div>
      </header>

      {/* Explorer Workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - var(--header-h))" }}>
        
        {/* Left Side Pane: Document List & Search Input */}
        <div style={{ width: "340px", borderRight: "1px solid var(--border-light)", backgroundColor: "var(--bg-panel)", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
            <form onSubmit={handleSearchChunks}>
              <div className="chat-input-wrapper" style={{ padding: "8px 12px" }}>
                <input
                  type="text"
                  placeholder="Vector search database..."
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "0.85rem", color: "var(--text-main)" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}>
                  <Search size={16} />
                </button>
              </div>
            </form>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 8px" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, marginBottom: "12px", paddingLeft: "8px" }}>
              Ingested Sources
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading files...
              </div>
            ) : documents.length === 0 ? (
              <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>
                No active files in the database.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.name}
                  className={`session-item ${activeFileName === doc.name ? "active" : ""}`}
                  style={{ padding: "12px" }}
                  onClick={() => handleSelectFile(doc.name)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doc.name}>
                        {doc.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      <span style={{ backgroundColor: "var(--primary-glow)", color: "var(--primary)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 }}>
                        {doc.category}
                      </span>
                      <span>{formatSize(doc.sizeBytes)}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)", opacity: activeFileName === doc.name ? 1 : 0 }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Reader Pane */}
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--bg-app)", padding: "40px" }}>
          <div style={{ maxWidth: "800px", margin: "auto" }}>
            
            {isSearching ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "12px", color: "var(--text-muted)" }}>
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
                <span style={{ fontSize: "0.9rem" }}>Searching and formatting index...</span>
              </div>
            ) : searchQuery && searchResults.length > 0 ? (
              // 1. Render Vector Search Chunk Results
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", marginBottom: "24px" }}>
                  <Sparkles size={22} fill="currentColor" />
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>RAG Similarity Search Matches</h2>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-sub)", marginBottom: "20px" }}>
                  Found {searchResults.length} matching text chunks in database query index:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {searchResults.map((res, index) => (
                    <div
                      key={res.chunk.id}
                      style={{
                        backgroundColor: "var(--bg-panel)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        padding: "20px",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Match #{index + 1} ➔ Source: <strong style={{ color: "var(--primary)" }}>{res.chunk.metadata.documentName}</strong>
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--accent-green-text)",
                            backgroundColor: "var(--accent-green)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Score: {(res.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-main)", fontStyle: "italic", borderLeft: "4px solid var(--primary)", paddingLeft: "14px" }}>
                        "{res.chunk.text}"
                      </div>
                      
                      {res.chunk.metadata.sectionHeader && (
                        <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Section: <strong>{res.chunk.metadata.sectionHeader}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : searchQuery ? (
              // Search query active but no results found
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center", gap: "12px" }}>
                <Search size={48} style={{ color: "var(--text-muted)" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Matches Found</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "340px" }}>
                  RAG returned no chunks above similarity score threshold for *"{searchQuery}"*. Try different keywords.
                </p>
              </div>
            ) : activeFileName && activeFileContent ? (
              // 2. Render Selected Document Content
              <div
                style={{
                  backgroundColor: "var(--bg-panel)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "40px",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={20} style={{ color: "var(--primary)" }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Reading: <strong>{activeFileName}</strong></span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> modified {new Date(documents.find(d => d.name === activeFileName)?.lastModified || "").toLocaleDateString()}</span>
                  </div>
                </div>

                <article className="document-article">
                  {renderDocumentMarkdown(activeFileContent)}
                </article>
              </div>
            ) : (
              // No document select default state
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center" }}>
                <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Select a Source Document</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "320px" }}>
                  Pick a document from the left list to read its original parsed contents, or run a query search across vectors.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
