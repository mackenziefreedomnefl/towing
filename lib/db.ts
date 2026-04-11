import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'towing.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS boats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boat_id TEXT UNIQUE,
        hin TEXT,
        fl_number TEXT,
        boat_name TEXT,
        make TEXT,
        home_port TEXT,
        year INTEGER,
        length TEXT,
        annual_dues INTEGER,
        active TEXT,
        renewed TEXT,
        transfer TEXT,
        expiration TEXT,
        archived INTEGER DEFAULT 0
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        boat_id TEXT,
        boat_name TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS boat_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boat_id TEXT NOT NULL,
        author TEXT,
        note TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    // Add archived column if missing (migration for existing db)
    try { db.exec('ALTER TABLE boats ADD COLUMN archived INTEGER DEFAULT 0'); } catch { /* already exists */ }
  }
  return db;
}

export interface Boat {
  id: number;
  boat_id: string;
  hin: string;
  fl_number: string;
  boat_name: string;
  make: string;
  home_port: string;
  year: number | null;
  length: string;
  annual_dues: number | null;
  active: string;
  renewed: string;
  transfer: string;
  expiration: string;
  archived: number;
}

export interface ActivityEntry {
  id: number;
  action: string;
  boat_id: string;
  boat_name: string;
  details: string;
  created_at: string;
}

export interface BoatNote {
  id: number;
  boat_id: string;
  author: string;
  note: string;
  created_at: string;
}

function logActivity(action: string, boatId: string, boatName: string, details: string) {
  getDb().prepare(
    'INSERT INTO activity_log (action, boat_id, boat_name, details) VALUES (?, ?, ?, ?)'
  ).run(action, boatId, boatName, details);
}

export function getRecentActivity(limit: number = 50): ActivityEntry[] {
  return getDb().prepare(
    'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as ActivityEntry[];
}

export function getAllBoats(includeArchived: boolean = false): Boat[] {
  if (includeArchived) {
    return getDb().prepare('SELECT * FROM boats ORDER BY archived ASC, boat_id').all() as Boat[];
  }
  return getDb().prepare('SELECT * FROM boats WHERE archived = 0 ORDER BY boat_id').all() as Boat[];
}

export function searchBoats(query: string): Boat[] {
  const q = `%${query}%`;
  return getDb().prepare(`
    SELECT * FROM boats
    WHERE archived = 0
      AND (boat_id LIKE ?
       OR boat_name LIKE ?
       OR fl_number LIKE ?
       OR hin LIKE ?
       OR make LIKE ?
       OR home_port LIKE ?)
    ORDER BY boat_name
  `).all(q, q, q, q, q, q) as Boat[];
}

export function getBoat(id: number): Boat | undefined {
  return getDb().prepare('SELECT * FROM boats WHERE id = ?').get(id) as Boat | undefined;
}

export function createBoat(boat: Omit<Boat, 'id' | 'archived'>): Boat {
  const stmt = getDb().prepare(`
    INSERT INTO boats (boat_id, hin, fl_number, boat_name, make, home_port, year, length, annual_dues, active, renewed, transfer, expiration, archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  const result = stmt.run(
    boat.boat_id, boat.hin, boat.fl_number, boat.boat_name, boat.make,
    boat.home_port, boat.year, boat.length, boat.annual_dues,
    boat.active, boat.renewed, boat.transfer, boat.expiration
  );
  logActivity('Added', boat.boat_id, boat.boat_name, `New boat added: ${boat.make} ${boat.length} at ${boat.home_port}`);
  return getBoat(result.lastInsertRowid as number)!;
}

export function updateBoat(id: number, boat: Partial<Omit<Boat, 'id'>>): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;

  const changes: string[] = [];
  const currentRec = current as unknown as Record<string, unknown>;
  for (const [key, val] of Object.entries(boat)) {
    if (val !== undefined && val !== currentRec[key]) {
      changes.push(`${key}: ${currentRec[key]} → ${val}`);
    }
  }

  const updated = { ...current, ...boat };
  getDb().prepare(`
    UPDATE boats SET
      boat_id = ?, hin = ?, fl_number = ?, boat_name = ?, make = ?,
      home_port = ?, year = ?, length = ?, annual_dues = ?,
      active = ?, renewed = ?, transfer = ?, expiration = ?, archived = ?
    WHERE id = ?
  `).run(
    updated.boat_id, updated.hin, updated.fl_number, updated.boat_name, updated.make,
    updated.home_port, updated.year, updated.length, updated.annual_dues,
    updated.active, updated.renewed, updated.transfer, updated.expiration,
    updated.archived,
    id
  );
  logActivity('Edited', updated.boat_id, updated.boat_name, changes.join(', ') || 'No field changes');
  return getBoat(id);
}

export function archiveBoat(id: number, reason: string = ''): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;
  getDb().prepare('UPDATE boats SET archived = 1 WHERE id = ?').run(id);
  const details = reason ? `Archived — ${reason}` : 'Boat archived';
  logActivity('Archived', current.boat_id, current.boat_name, details);
  addNote(current.boat_id, 'System', details);
  return getBoat(id);
}

export function unarchiveBoat(id: number): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;
  getDb().prepare('UPDATE boats SET archived = 0 WHERE id = ?').run(id);
  logActivity('Unarchived', current.boat_id, current.boat_name, 'Boat restored from archive');
  addNote(current.boat_id, 'System', 'Boat was restored from archive');
  return getBoat(id);
}

export function deleteBoat(id: number): boolean {
  const current = getBoat(id);
  if (!current) return false;
  logActivity('Deleted', current.boat_id, current.boat_name, `Removed from system`);
  const result = getDb().prepare('DELETE FROM boats WHERE id = ?').run(id);
  return result.changes > 0;
}

// Notes
export function getBoatNotes(boatId: string): BoatNote[] {
  return getDb().prepare(
    'SELECT * FROM boat_notes WHERE boat_id = ? ORDER BY created_at DESC'
  ).all(boatId) as BoatNote[];
}

export function addNote(boatId: string, author: string, note: string): BoatNote {
  const result = getDb().prepare(
    'INSERT INTO boat_notes (boat_id, author, note) VALUES (?, ?, ?)'
  ).run(boatId, author, note);
  return getDb().prepare('SELECT * FROM boat_notes WHERE id = ?').get(result.lastInsertRowid as number) as BoatNote;
}

export function getBoatHistory(boatId: string): ActivityEntry[] {
  return getDb().prepare(
    'SELECT * FROM activity_log WHERE boat_id = ? ORDER BY created_at DESC'
  ).all(boatId) as ActivityEntry[];
}
