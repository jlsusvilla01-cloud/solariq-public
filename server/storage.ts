import { IStorage } from "./storage-interface.js";
import { MemStorage } from "./mem-storage.js";

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const useFirebase = !!process.env.FIREBASE_PROJECT_ID;
const useMock = isVercel && !process.env.DATABASE_URL && !useFirebase;

let storage: IStorage;
let db: any;
let client: any;

/**
 * Initializes the database storage system.
 * Priority: Firebase > LibSQL > Memory (Vercel Fallback)
 */
async function initDb() {
  if (useFirebase) {
    console.log("Initializing Firebase Firestore Storage");
    try {
      const { FirebaseStorage } = await import("./firebase-storage.js");
      storage = new FirebaseStorage();
    } catch (err) {
      console.error("Failed to load Firebase storage, falling back to Memory:", err);
      storage = new MemStorage();
    }
  } else if (useMock) {
    console.log("Initializing In-Memory Storage (Vercel Fallback)");
    storage = new MemStorage();
  } else {
    console.log("Initializing LibSQL Storage");
    try {
      const module = await eval('import("./libsql-storage.js")');
      const { LibSQLStorage, getLibSQLDb } = module;
      storage = new LibSQLStorage();
      const libs = getLibSQLDb();
      db = libs.db;
      client = libs.client;
    } catch (err) {
      console.error("Failed to load LibSQL storage, falling back to Memory:", err);
      storage = new MemStorage();
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
