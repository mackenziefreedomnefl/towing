import { NextRequest, NextResponse } from 'next/server';
import { getAllBoats } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Read the file into a buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Parse with xlsx (handles both CSV and XLSX)
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
  }

  // Find the HIN column — look for common header names
  const headers = Object.keys(rows[0]);
  const hinKey = headers.find((h) => {
    const lower = h.toLowerCase().trim();
    return (
      lower === 'hin' ||
      lower === 'hull id' ||
      lower === 'hull id number' ||
      lower === 'hull_id' ||
      lower === 'hull identification number' ||
      lower === 'vin' ||
      lower === 'vin/sn' ||
      lower === 'vin/serial' ||
      lower === 'serial number' ||
      lower === 'hull number' ||
      lower === 'hull #'
    );
  });

  if (!hinKey) {
    return NextResponse.json(
      { error: `Could not find HIN column. Found columns: ${headers.join(', ')}`, headers },
      { status: 400 }
    );
  }

  // Also try to find a name column for display
  const nameKey = headers.find((h) => {
    const lower = h.toLowerCase().trim();
    return lower === 'name' || lower === 'boat name' || lower === 'boat_name' || lower === 'vessel name' || lower === 'vessel';
  });

  // Extract HINs from uploaded file
  const fleetioBoats = rows
    .map((row) => ({
      hin: String(row[hinKey] ?? '').trim().toUpperCase(),
      name: nameKey ? String(row[nameKey] ?? '').trim() : '',
      raw: row,
    }))
    .filter((b) => b.hin.length > 0);

  // Get all active boats from our DB
  const activeBoats = getAllBoats(false);
  const allBoats = getAllBoats(true);

  // Build a lookup by HIN (normalize to uppercase, trim whitespace)
  const towingByHin = new Map<string, typeof activeBoats[0]>();
  for (const boat of activeBoats) {
    const hin = (boat.hin || '').trim().toUpperCase();
    if (hin) towingByHin.set(hin, boat);
  }

  const fleetioHins = new Set(fleetioBoats.map((b) => b.hin));

  // Categorize
  const matched: Array<{
    hin: string;
    towingBoat: { boat_id: string; boat_name: string; make: string; home_port: string };
    fleetioName: string;
  }> = [];

  const towingOnly: Array<{
    hin: string;
    boat_id: string;
    boat_name: string;
    make: string;
    home_port: string;
  }> = [];

  const fleetioOnly: Array<{
    hin: string;
    name: string;
  }> = [];

  // Check each fleetio boat against towing list
  for (const fb of fleetioBoats) {
    const towingBoat = towingByHin.get(fb.hin);
    if (towingBoat) {
      matched.push({
        hin: fb.hin,
        towingBoat: {
          boat_id: towingBoat.boat_id,
          boat_name: towingBoat.boat_name,
          make: towingBoat.make,
          home_port: towingBoat.home_port,
        },
        fleetioName: fb.name,
      });
    } else {
      fleetioOnly.push({ hin: fb.hin, name: fb.name });
    }
  }

  // Check each towing boat not in fleetio
  for (const [hin, boat] of towingByHin) {
    if (!fleetioHins.has(hin)) {
      towingOnly.push({
        hin,
        boat_id: boat.boat_id,
        boat_name: boat.boat_name,
        make: boat.make,
        home_port: boat.home_port,
      });
    }
  }

  return NextResponse.json({
    summary: {
      fleetioTotal: fleetioBoats.length,
      towingActive: activeBoats.length,
      matched: matched.length,
      towingOnly: towingOnly.length,
      fleetioOnly: fleetioOnly.length,
    },
    matched,
    towingOnly,
    fleetioOnly,
    hinColumn: hinKey,
    nameColumn: nameKey || null,
  });
}
