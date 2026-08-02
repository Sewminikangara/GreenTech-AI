import fs from "fs";
import path from "path";

export interface Session {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceCitation {
  documentName: string;
  pageNumber?: number;
  url?: string;
  snippet: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: SourceCitation[];
  feedback?: {
    rating: "like" | "dislike";
    comment?: string;
  };
}

interface DatabaseSchema {
  sessions: Session[];
  messages: Message[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

/**
 * Ensures that the data directory and db.json file exist.
 */
function ensureDbExists() {
  const dirPath = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialDb: DatabaseSchema = { sessions: [], messages: [] };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
  }
}

/**
 * Reads database contents.
 */
async function readDb(): Promise<DatabaseSchema> {
  ensureDbExists();
  try {
    const data = await fs.promises.readFile(DB_FILE_PATH, "utf-8");
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error("Error reading db file, resetting database:", error);
    return { sessions: [], messages: [] };
  }
}

/**
 * Writes database contents.
 */
async function writeDb(db: DatabaseSchema): Promise<void> {
  ensureDbExists();
  await fs.promises.writeFile(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/**
 * Helper to generate random IDs.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// DATABASE OPERATIONS

export async function createSession(userId: string, title: string = "New Chat"): Promise<Session> {
  const db = await readDb();
  const newSession: Session = {
    id: generateId(),
    userId,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.sessions.push(newSession);
  await writeDb(db);
  return newSession;
}

export async function getSessions(userId: string): Promise<Session[]> {
  const db = await readDb();
  return db.sessions
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const db = await readDb();
  return db.sessions.find((s) => s.id === sessionId) || null;
}

export async function renameSession(sessionId: string, newTitle: string): Promise<boolean> {
  const db = await readDb();
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return false;
  session.title = newTitle;
  session.updatedAt = new Date().toISOString();
  await writeDb(db);
  return true;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const db = await readDb();
  const initialCount = db.sessions.length;
  db.sessions = db.sessions.filter((s) => s.id !== sessionId);
  db.messages = db.messages.filter((m) => m.sessionId !== sessionId);
  await writeDb(db);
  return db.sessions.length < initialCount;
}

export async function saveMessage(
  sessionId: string,
  sender: "user" | "assistant",
  text: string,
  sources?: SourceCitation[]
): Promise<Message> {
  const db = await readDb();
  const newMessage: Message = {
    id: generateId(),
    sessionId,
    sender,
    text,
    timestamp: new Date().toISOString(),
    sources,
  };
  db.messages.push(newMessage);

  // Update session updatedAt timestamp
  const session = db.sessions.find((s) => s.id === sessionId);
  if (session) {
    session.updatedAt = new Date().toISOString();
    
    // Auto-rename from "New Chat" on the first message
    if (session.title === "New Chat" && sender === "user") {
      session.title = text.length > 30 ? text.substring(0, 27) + "..." : text;
    }
  }

  await writeDb(db);
  return newMessage;
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  const db = await readDb();
  return db.messages
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function saveFeedback(
  messageId: string,
  rating: "like" | "dislike",
  comment?: string
): Promise<boolean> {
  const db = await readDb();
  const message = db.messages.find((m) => m.id === messageId);
  if (!message) return false;
  message.feedback = { rating, comment };
  await writeDb(db);
  return true;
}
