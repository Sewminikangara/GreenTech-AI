"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Home,
  MessageSquare,
  BookOpen,
  Calculator,
  Upload,
  RefreshCw,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Activity,
  FileText,
  AlertTriangle,
  Clock,
  Check,
  Search,
  Sparkles
} from "lucide-react";

interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  likesCount: number;
  dislikesCount: number;
  dislikeLogs: Array<{
    id: string;
    timestamp: string;
    query: string;
    response: string;
    comment: string;
  }>;
  popularKeywords: Array<{ word: string; count: number }>;
}

interface DocumentItem {
  name: string;
  sizeBytes: number;
  lastModified: string;
  category: string;
}

export default function AdminDashboard() {
  // States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Ingestion states
  const [ingestLoading, setIngestLoading] = useState<boolean>(false);
  const [ingestStatus, setIngestStatus] = useState<string>("");

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAnalytics(), fetchDocuments()]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  // Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        setSelectedFile(file);
        setUploadMessage(null);
      } else {
        setSelectedFile(null);
        setUploadMessage({ text: "Only .txt and .md files are supported.", isError: true });
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadMessage({ text: `Successfully uploaded ${selectedFile.name}! Please re-index the database to update search vectors.`, isError: false });
        setSelectedFile(null);
        fetchDocuments();
      } else {
        const data = await res.json();
        setUploadMessage({ text: data.error || "Upload failed.", isError: true });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadMessage({ text: "Network error during upload.", isError: true });
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete document handler
  const handleDeleteDoc = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove it from the knowledge folder.`)) return;
    try {
      const res = await fetch(`/api/documents?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Error deleting doc:", err);
    }
  };

  // Run dynamic RAG indexing
  const handleTriggerIngestion = async () => {
    setIngestLoading(true);
    setIngestStatus("Chunking files and calculating embeddings...");
    try {
      const res = await fetch("/api/documents/ingest", {
        method: "POST",
      });
      
      const data = await res.json();
      if (res.ok) {
        setIngestStatus(`Success! ${data.message}`);
        fetchAnalytics(); // Refresh analytics keywords
      } else {
        setIngestStatus(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error("Ingestion request error:", err);
      setIngestStatus("Network timeout. Embedding calculation failed.");
    } finally {
      setIngestLoading(false);
    }
  };

  // Render helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Navbar Header */}
      <header className="top-header">
        <div className="header-left">
          <div className="brand" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
            <Shield size={20} style={{ color: "var(--primary)" }} />
            <span className="brand-title">Admin Console</span>
          </div>
        </div>
        
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="/" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Home size={14} /> Home
          </a>
          <a href="/chat" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageSquare size={14} /> Chat
          </a>
          <a href="/explorer" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <BookOpen size={14} /> Explorer
          </a>
          <a href="/recommendations" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Calculator size={14} /> Calculator
          </a>
        </nav>
        
        <div className="header-right">
          <button className="icon-btn" onClick={fetchData} title="Refresh Dashboard">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div style={{ flex: 1, padding: "40px 24px", maxWidth: "1100px", margin: "auto", width: "100%", display: "flex", flexDirection: "column", gap: "36px" }}>
        
        {/* Loader */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Analytics Cards Overview */}
            {analytics && (
              <section>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  
                  {/* Card 1: Chats */}
                  <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ backgroundColor: "var(--primary-glow)", color: "var(--primary)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Sessions</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{analytics.totalSessions}</div>
                    </div>
                  </div>

                  {/* Card 2: Messages */}
                  <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Messages</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{analytics.totalMessages}</div>
                    </div>
                  </div>

                  {/* Card 3: Avg Messages */}
                  <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ backgroundColor: "rgba(234, 179, 8, 0.1)", color: "#eab308", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Avg Depth</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{analytics.avgMessagesPerSession} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>msgs</span></div>
                    </div>
                  </div>

                  {/* Card 4: Likes */}
                  <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ backgroundColor: "var(--primary-glow)", color: "var(--primary)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ThumbsUp size={20} fill="currentColor" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Likes</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>{analytics.likesCount}</div>
                    </div>
                  </div>

                  {/* Card 5: Dislikes */}
                  <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ThumbsDown size={20} fill="currentColor" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Dislikes</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ef4444" }}>{analytics.dislikesCount}</div>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* 2. Document & Indexing Manager */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              
              {/* Document Manager Table */}
              <div style={{ flex: 1.5, minWidth: "360px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={18} style={{ color: "var(--primary)" }} /> Reference Materials Manager
                </h3>

                <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border-light)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "8px 4px" }}>Filename</th>
                        <th style={{ padding: "8px 4px" }}>Category</th>
                        <th style={{ padding: "8px 4px" }}>Size</th>
                        <th style={{ padding: "8px 4px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: "16px 4px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                            No documents in the folder.
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.name} style={{ borderBottom: "1px solid var(--border-light)" }}>
                            <td style={{ padding: "10px 4px", fontWeight: 600 }}>{doc.name}</td>
                            <td style={{ padding: "10px 4px" }}>
                              <span style={{ fontSize: "0.65rem", backgroundColor: "var(--primary-glow)", color: "var(--primary)", padding: "1px 6px", borderRadius: "4px" }}>
                                {doc.category}
                              </span>
                            </td>
                            <td style={{ padding: "10px 4px" }}>{formatSize(doc.sizeBytes)}</td>
                            <td style={{ padding: "10px 4px", textAlign: "right" }}>
                              <button
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                                onClick={() => handleDeleteDoc(doc.name)}
                                title="Delete document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Database Ingester Trigger */}
                <div style={{ backgroundColor: "var(--bg-app)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 700 }}>
                      <Sparkles size={16} style={{ color: "var(--primary)" }} /> Re-build RAG Vector Store
                    </div>
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={handleTriggerIngestion}
                      disabled={ingestLoading}
                    >
                      <RefreshCw size={12} className={ingestLoading ? "spin" : ""} /> {ingestLoading ? "Indexing..." : "Index Database"}
                    </button>
                  </div>
                  {ingestStatus && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: ingestStatus.startsWith("Failed") ? "#ef4444" : "var(--accent-green-text)",
                        backgroundColor: ingestStatus.startsWith("Failed") ? "rgba(239, 68, 68, 0.05)" : "var(--accent-green)",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        lineHeight: "1.4",
                        fontWeight: 650,
                      }}
                    >
                      {ingestStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Uploader Drag & Drop */}
              <div style={{ flex: 1, minWidth: "300px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Upload size={18} style={{ color: "var(--primary)" }} /> Upload Literature
                  </h3>

                  <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div
                      style={{
                        border: "2px dashed var(--border-light)",
                        borderRadius: "12px",
                        padding: "30px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "var(--bg-app)",
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
                            setSelectedFile(file);
                            setUploadMessage(null);
                          }
                        }
                      }}
                    >
                      <input
                        type="file"
                        accept=".txt,.md"
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                        onChange={handleFileChange}
                      />
                      <Upload size={28} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {selectedFile ? selectedFile.name : "Drag & drop file here"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Supports .txt and .md formats
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: "10px", width: "100%" }}
                      disabled={!selectedFile || uploadLoading}
                    >
                      {uploadLoading ? "Uploading file..." : "Upload Document"}
                    </button>
                  </form>
                </div>

                {uploadMessage && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      marginTop: "16px",
                      backgroundColor: uploadMessage.isError ? "rgba(239, 68, 68, 0.05)" : "var(--accent-green)",
                      color: uploadMessage.isError ? "#ef4444" : "var(--accent-green-text)",
                      lineHeight: "1.4",
                      fontWeight: 600,
                    }}
                  >
                    {uploadMessage.text}
                  </div>
                )}
              </div>

            </div>

            {/* 3. Word Frequencies & Chat Audit Logs */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              
              {/* Popular Queries Frequency chart */}
              {analytics && analytics.popularKeywords.length > 0 && (
                <div style={{ flex: 1, minWidth: "300px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Search size={18} style={{ color: "var(--primary)" }} /> Undergraduate Search Interests
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Most frequent substantive terms in user prompts:
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {analytics.popularKeywords.map((item) => {
                      const maxCount = analytics.popularKeywords[0].count;
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item.word} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem" }}>
                          <span style={{ width: "90px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.word}</span>
                          <div style={{ flex: 1, backgroundColor: "var(--bg-app)", height: "14px", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: "var(--primary)", width: `${percentage}%`, height: "100%", borderRadius: "4px" }}></div>
                          </div>
                          <span style={{ color: "var(--text-muted)", width: "30px", textAlign: "right" }}>{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RAG Feedback & Quality Audits */}
              {analytics && (
                <div style={{ flex: 1.5, minWidth: "360px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertTriangle size={18} style={{ color: "#ef4444" }} /> RAG Quality Audits & Dislikes
                  </h3>
                  
                  {analytics.dislikeLogs.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "180px", color: "var(--text-muted)", gap: "8px" }}>
                      <Check size={32} style={{ color: "var(--primary)" }} />
                      <span style={{ fontSize: "0.85rem", fontStyle: "italic" }}>No negative feedback logged. Response quality audit clean!</span>
                    </div>
                  ) : (
                    <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {analytics.dislikeLogs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-app)",
                            padding: "14px",
                            borderRadius: "10px",
                            fontSize: "0.8rem",
                            lineHeight: "1.4",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "8px" }}>
                            <span>Timestamp: {new Date(log.timestamp).toLocaleString()}</span>
                            <span style={{ color: "#ef4444", fontWeight: 700 }}>Logged Dislike</span>
                          </div>
                          <div style={{ marginBottom: "6px" }}>
                            <strong>Query:</strong> <span style={{ color: "var(--text-sub)" }}>"{log.query}"</span>
                          </div>
                          <div style={{ marginBottom: "6px" }}>
                            <strong>Response:</strong> <span style={{ color: "var(--text-muted)" }}>"{log.response.substring(0, 100)}..."</span>
                          </div>
                          <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "8px", color: "#b45309", fontWeight: 600 }}>
                            Comment: "{log.comment}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* Rotation animation for spinner */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
