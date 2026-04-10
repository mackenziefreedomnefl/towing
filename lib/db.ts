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
        expiration TEXT
      )
    `);
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
}

export function getAllBoats(): Boat[] {
  return getDb().prepare('SELECT * FROM boats ORDER BY boat_id').all() as Boat[];
}

export function searchBoats(query: string): Boat[] {
  const q = `%${query}%`;
  return getDb().prepare(`
    SELECT * FROM boats
    WHERE boat_id LIKE ?
       OR boat_name LIKE ?
       OR fl_number LIKE ?
       OR hin LIKE ?
       OR make LIKE ?
       OR home_port LIKE ?
    ORDER BY boat_name
  `).all(q, q, q, q, q, q) as Boat[];
}

export function getBoat(id: number): Boat | undefined {
  return getDb().prepare('SELECT * FROM boats WHERE id = ?').get(id) as Boat | undefined;
}

export function createBoat(boat: Omit<Boat, 'id'>): Boat {
  const stmt = getDb().prepare(`
    INSERT INTO boats (boat_id, hin, fl_number, boat_name, make, home_port, year, length, annual_dues, active, renewed, transfer, expiration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    boat.boat_id, boat.hin, boat.fl_number, boat.boat_name, boat.make,
    boat.home_port, boat.year, boat.length, boat.annual_dues,
    boat.active, boat.renewed, boat.transfer, boat.expiration
  );
  return getBoat(result.lastInsertRowid as number)!;
}

export function updateBoat(id: number, boat: Partial<Omit<Boat, 'id'>>): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;

  const updated = { ...current, ...boat };
  getDb().prepare(`
    UPDATE boats SET
      boat_id = ?, hin = ?, fl_number = ?, boat_name = ?, make = ?,
      home_port = ?, year = ?, length = ?, annual_dues = ?,
      active = ?, renewed = ?, transfer = ?, expiration = ?
    WHERE id = ?
  `).run(
    updated.boat_id, updated.hin, updated.fl_number, updated.boat_name, updated.make,
    updated.home_port, updated.year, updated.length, updated.annual_dues,
    updated.active, updated.renewed, updated.transfer, updated.expiration,
    id
  );
  return getBoat(id);
}

export function deleteBoat(id: number): boolean {
  const result = getDb().prepare('DELETE FROM boats WHERE id = ?').run(id);
  return result.changes > 0;
}
