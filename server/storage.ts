import { IStorage } from "./storage-interface.js";
import { MemStorage } from "./mem-storage.js";

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const useMock = isVercel && !process.env.DATABASE_URL;

let storage: IStorage;
let db: any;
let client: any;

/**
 * Initializes the database storage system.
 * Uses dynamic imports to isolate native dependencies (@libsql/client)
 * which cause 500 errors in the Vercel serverless environment.
 */
async function initDb() {
  if (useMock) {
    console.log("Initializing In-Memory Storage (Vercel Fallback)");
    storage = new MemStorage();
    // In mock mode, db and client remain undefined or could be mocked if needed
  } else {
    console.log("Initializing LibSQL Storage");
    try {
      // Obfuscating the path to prevent Vercel NFT/esbuild from static tracing
      const lp = "./libsql-storage.js";
      const { LibSQLStorage, getLibSQLDb } = await import(lp);
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
