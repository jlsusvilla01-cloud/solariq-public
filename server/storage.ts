import { IStorage } from "./storage-interface.js";
import { MemStorage } from "./mem-storage.js";

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const useFirebase = !!process.env.FIREBASE_PROJECT_ID;
const useMock = isVercel && !process.env.DATABASE_URL && !useFirebase;

let storage: IStorage;
let db: any;
let client: any;

/**
 * What the app is actually storing data in. When a database is configured but fails to start,
 * the app falls back to memory so it stays up, and this records why so the admin can see it.
 */
export const storageStatus: { mode: "firebase" | "libsql" | "memory"; persistent: boolean; problem: string | null } = {
  mode: "memory",
  persistent: false,
  problem: null,
};

function firebaseProblem(): string | null {
  const missing = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].filter(k => !process.env[k]);
  return missing.length ? `Firebase is missing ${missing.join(", ")} in the environment variables.` : null;
}

/**
 * Initializes the database storage system.
 * Priority: Firebase > LibSQL > Memory (Vercel Fallback)
 */
async function initDb() {
  if (useFirebase) {
    console.log("Initializing Firebase Firestore Storage");
    try {
      const missing = firebaseProblem();
      if (missing) throw new Error(missing);
      const { FirebaseStorage } = await import("./firebase-storage.js");
      storage = new FirebaseStorage();
      Object.assign(storageStatus, { mode: "firebase", persistent: true, problem: null });
    } catch (err: any) {
      console.error("Failed to load Firebase storage, falling back to Memory:", err);
      storage = new MemStorage();
      Object.assign(storageStatus, {
        mode: "memory",
        persistent: false,
        problem: `Firebase could not start, so data is kept in temporary memory and is lost on restart. ${err?.message ?? ""}`.trim(),
      });
    }
  } else if (useMock) {
    console.log("Initializing In-Memory Storage (Vercel Fallback)");
    storage = new MemStorage();
    Object.assign(storageStatus, {
      mode: "memory",
      persistent: false,
      problem: "No database is configured, so data is kept in temporary memory and is lost on restart.",
    });
  } else {
    console.log("Initializing LibSQL Storage");
    try {
      const module = await eval('import("./libsql-storage.js")');
      const { LibSQLStorage, getLibSQLDb } = module;
      storage = new LibSQLStorage();
      await storage.init?.();
      Object.assign(storageStatus, { mode: "libsql", persistent: true, problem: null });
      const libs = getLibSQLDb();
      db = libs.db;
      client = libs.client;
    } catch (err) {
      console.error("Failed to load LibSQL storage, falling back to Memory:", err);
      storage = new MemStorage();
      Object.assign(storageStatus, {
        mode: "memory",
        persistent: false,
        problem: `The database could not start, so data is kept in temporary memory and is lost on restart. ${(err as any)?.message ?? ""}`.trim(),
      });
    }
  }
  return storage;
}

// Seed function placeholder
async function seedAll() {
  if (useMock) return;
  // Seeding logic would go here if needed for the real DB
}

export { storage, db, client, initDb, seedAll };
