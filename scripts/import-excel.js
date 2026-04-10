const XLSX = require('xlsx');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(require('os').homedir(), 'Downloads', 'Current towing list.xlsx');
const DB_PATH = path.join(__dirname, '..', 'data', 'towing.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Open workbook
const workbook = XLSX.readFile(EXCEL_PATH);
const sheet = workbook.Sheets['Towing List'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Open database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  DROP TABLE IF EXISTS boats;
  CREATE TABLE boats (
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

const insert = db.prepare(`
  INSERT OR IGNORE INTO boats (boat_id, hin, fl_number, boat_name, make, home_port, year, length, annual_dues, active, renewed, transfer, expiration)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function excelDateToString(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial date
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

let imported = 0;
const insertMany = db.transaction(() => {
  // Row 0 is the title row, row 1 is headers, data starts at row 2
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue; // skip empty rows

    const boatId = String(row[0] || '').trim();
    if (!boatId || !boatId.startsWith('BT')) continue; // skip non-data rows

    const hin = String(row[1] || '').trim();
    const flNumber = String(row[2] || '').trim();
    const boatName = String(row[3] || '').trim();
    const make = String(row[4] || '').trim();
    const homePort = String(row[5] || '').trim();
    const year = row[6] ? parseInt(String(row[6])) : null;
    const length = String(row[7] || '').trim();
    const annualDues = row[8] ? parseInt(String(row[8])) : null;
    const active = excelDateToString(row[9]);
    const renewed = excelDateToString(row[10]);
    const transfer = String(row[11] || '').trim();
    const expiration = excelDateToString(row[12]);

    insert.run(boatId, hin, flNumber, boatName, make, homePort, year, length, annualDues, active, renewed, transfer, expiration);
    imported++;
  }
});

insertMany();

console.log(`Imported ${imported} boats into ${DB_PATH}`);

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM boats').get();
console.log(`Total boats in database: ${count.count}`);

const sample = db.prepare('SELECT * FROM boats LIMIT 3').all();
console.log('Sample entries:', JSON.stringify(sample, null, 2));

db.close();
