import { createSeed, DB_VERSION, type Database } from "./seed";

/**
 * In-memory "database" persisted to localStorage so the draft keeps state
 * across reloads. Nothing here ever leaves the browser.
 */

const STORAGE_KEY = "octap.mockdb";

function load(): Database | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Database;
    return parsed.version === DB_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

let db: Database = load() ?? createSeed();

export function getDb() {
  return db;
}

export function commit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or unavailable: keep working in memory.
  }
}

export function resetDb() {
  db = createSeed();
  commit();
}

commit();
