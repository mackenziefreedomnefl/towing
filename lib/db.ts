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
        boat_db_id INTEGER,
        snapshot_before TEXT,
        snapshot_after TEXT,
        undone INTEGER DEFAULT 0,
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
    // Migrations for existing db
    try { db.exec('ALTER TABLE boats ADD COLUMN archived INTEGER DEFAULT 0'); } catch { /* exists */ }
    try { db.exec('ALTER TABLE activity_log ADD COLUMN boat_db_id INTEGER'); } catch { /* exists */ }
    try { db.exec('ALTER TABLE activity_log ADD COLUMN snapshot_before TEXT'); } catch { /* exists */ }
    try { db.exec('ALTER TABLE activity_log ADD COLUMN snapshot_after TEXT'); } catch { /* exists */ }
    try { db.exec('ALTER TABLE activity_log ADD COLUMN undone INTEGER DEFAULT 0'); } catch { /* exists */ }
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
  boat_db_id: number | null;
  snapshot_before: string | null;
  snapshot_after: string | null;
  undone: number;
  created_at: string;
}

export interface BoatNote {
  id: number;
  boat_id: string;
  author: string;
  note: string;
  created_at: string;
}

function logActivity(action: string, boatId: string, boatName: string, details: string, boatDbId?: number, before?: Boat | null, after?: Boat | null) {
  getDb().prepare(
    'INSERT INTO activity_log (action, boat_id, boat_name, details, boat_db_id, snapshot_before, snapshot_after) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    action, boatId, boatName, details,
    boatDbId ?? null,
    before ? JSON.stringify(before) : null,
    after ? JSON.stringify(after) : null,
  );
}

export function getRecentActivity(limit: number = 50): ActivityEntry[] {
  return getDb().prepare(
    'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as ActivityEntry[];
}

export function getActivityEntry(id: number): ActivityEntry | undefined {
  return getDb().prepare('SELECT * FROM activity_log WHERE id = ?').get(id) as ActivityEntry | undefined;
}

export function undoActivity(activityId: number): { success: boolean; message: string } {
  const entry = getActivityEntry(activityId);
  if (!entry) return { success: false, message: 'Activity not found' };
  if (entry.undone) return { success: false, message: 'Already undone' };

  // Check 7-day limit
  const created = new Date(entry.created_at + 'Z');
  const now = new Date();
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 7) return { success: false, message: 'Cannot undo changes older than 7 days' };

  if (entry.snapshot_before && entry.boat_db_id) {
    const before = JSON.parse(entry.snapshot_before) as Boat;
    const current = getBoat(entry.boat_db_id);
    if (current) {
      // Restore boat to before state
      getDb().prepare(`
        UPDATE boats SET
          boat_id = ?, hin = ?, fl_number = ?, boat_name = ?, make = ?,
          home_port = ?, year = ?, length = ?, annual_dues = ?,
          active = ?, renewed = ?, transfer = ?, expiration = ?, archived = ?
        WHERE id = ?
      `).run(
        before.boat_id, before.hin, before.fl_number, before.boat_name, before.make,
        before.home_port, before.year, before.length, before.annual_dues,
        before.active, before.renewed, before.transfer, before.expiration,
        before.archived,
        entry.boat_db_id
      );
    }
  } else if (entry.action === 'Added' && entry.boat_db_id) {
    // Undo an add = delete the boat
    getDb().prepare('DELETE FROM boats WHERE id = ?').run(entry.boat_db_id);
  } else if (entry.action === 'Deleted' && entry.snapshot_before) {
    // Undo a delete = re-insert
    const before = JSON.parse(entry.snapshot_before) as Boat;
    try {
      getDb().prepare(`
        INSERT INTO boats (boat_id, hin, fl_number, boat_name, make, home_port, year, length, annual_dues, active, renewed, transfer, expiration, archived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        before.boat_id, before.hin, before.fl_number, before.boat_name, before.make,
        before.home_port, before.year, before.length, before.annual_dues,
        before.active, before.renewed, before.transfer, before.expiration,
        before.archived
      );
    } catch {
      return { success: false, message: 'Could not restore — BT# may already exist' };
    }
  } else {
    return { success: false, message: 'No snapshot available to undo' };
  }

  // Mark as undone
  getDb().prepare('UPDATE activity_log SET undone = 1 WHERE id = ?').run(activityId);
  logActivity('Undo', entry.boat_id, entry.boat_name, `Undid: ${entry.action} — ${entry.details}`);
  return { success: true, message: `Undid "${entry.action}" on ${entry.boat_name}` };
}

export function redoActivity(activityId: number): { success: boolean; message: string } {
  const entry = getActivityEntry(activityId);
  if (!entry) return { success: false, message: 'Activity not found' };
  if (!entry.undone) return { success: false, message: 'Not undone — nothing to redo' };

  const created = new Date(entry.created_at + 'Z');
  const now = new Date();
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 7) return { success: false, message: 'Cannot redo changes older than 7 days' };

  if (entry.snapshot_after && entry.boat_db_id) {
    const after = JSON.parse(entry.snapshot_after) as Boat;
    const current = getBoat(entry.boat_db_id);
    if (current) {
      getDb().prepare(`
        UPDATE boats SET
          boat_id = ?, hin = ?, fl_number = ?, boat_name = ?, make = ?,
          home_port = ?, year = ?, length = ?, annual_dues = ?,
          active = ?, renewed = ?, transfer = ?, expiration = ?, archived = ?
        WHERE id = ?
      `).run(
        after.boat_id, after.hin, after.fl_number, after.boat_name, after.make,
        after.home_port, after.year, after.length, after.annual_dues,
        after.active, after.renewed, after.transfer, after.expiration,
        after.archived,
        entry.boat_db_id
      );
    }
  } else if (entry.action === 'Added' && entry.snapshot_after) {
    const after = JSON.parse(entry.snapshot_after) as Boat;
    try {
      getDb().prepare(`
        INSERT INTO boats (boat_id, hin, fl_number, boat_name, make, home_port, year, length, annual_dues, active, renewed, transfer, expiration, archived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        after.boat_id, after.hin, after.fl_number, after.boat_name, after.make,
        after.home_port, after.year, after.length, after.annual_dues,
        after.active, after.renewed, after.transfer, after.expiration,
        after.archived
      );
    } catch {
      return { success: false, message: 'Could not redo — BT# may already exist' };
    }
  } else {
    return { success: false, message: 'No snapshot available to redo' };
  }

  getDb().prepare('UPDATE activity_log SET undone = 0 WHERE id = ?').run(activityId);
  logActivity('Redo', entry.boat_id, entry.boat_name, `Redid: ${entry.action} — ${entry.details}`);
  return { success: true, message: `Redid "${entry.action}" on ${entry.boat_name}` };
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
  const created = getBoat(result.lastInsertRowid as number)!;
  logActivity('Added', boat.boat_id, boat.boat_name, `New boat added: ${boat.make} ${boat.length} at ${boat.home_port}`, created.id, null, created);
  return created;
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
  const after = getBoat(id)!;
  logActivity('Edited', updated.boat_id, updated.boat_name, changes.join(', ') || 'No field changes', id, current, after);
  return after;
}

export function renewBoat(id: number): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;

  // Calculate new expiration: 1 year from current expiration, or 1 year from today if no expiration
  let newExp: string;
  if (current.expiration) {
    const expDate = new Date(current.expiration);
    expDate.setFullYear(expDate.getFullYear() + 1);
    newExp = expDate.toISOString().split('T')[0];
  } else {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    newExp = d.toISOString().split('T')[0];
  }

  const today = new Date().toISOString().split('T')[0];

  getDb().prepare(`
    UPDATE boats SET expiration = ?, renewed = ? WHERE id = ?
  `).run(newExp, today, id);

  const after = getBoat(id)!;
  logActivity('Renewed', current.boat_id, current.boat_name, `Renewed: ${current.expiration} → ${newExp}`, id, current, after);
  addNote(current.boat_id, 'System', `Membership renewed. Expiration extended from ${current.expiration || 'none'} to ${newExp}`);
  return after;
}

export function archiveBoat(id: number, reason: string = ''): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;
  getDb().prepare('UPDATE boats SET archived = 1 WHERE id = ?').run(id);
  const details = reason ? `Archived — ${reason}` : 'Boat archived';
  const after = getBoat(id)!;
  logActivity('Archived', current.boat_id, current.boat_name, details, id, current, after);
  addNote(current.boat_id, 'System', details);
  return after;
}

export function unarchiveBoat(id: number): Boat | undefined {
  const current = getBoat(id);
  if (!current) return undefined;
  getDb().prepare('UPDATE boats SET archived = 0 WHERE id = ?').run(id);
  const after = getBoat(id)!;
  logActivity('Unarchived', current.boat_id, current.boat_name, 'Boat restored from archive', id, current, after);
  addNote(current.boat_id, 'System', 'Boat was restored from archive');
  return after;
}

export function deleteBoat(id: number): boolean {
  const current = getBoat(id);
  if (!current) return false;
  logActivity('Deleted', current.boat_id, current.boat_name, `Removed from system`, id, current, null);
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
