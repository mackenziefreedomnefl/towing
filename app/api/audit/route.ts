import { NextRequest, NextResponse } from 'next/server';
import { getAllBoats } from '@/lib/db';
import * as XLSX from 'xlsx';

function findCol(headers: string[], ...candidates: string[]): string | undefined {
  return headers.find((h) => {
    const lower = h.toLowerCase().trim();
    return candidates.includes(lower);
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
  }

  const headers = Object.keys(rows[0]);

  // Detect columns
  const hinKey = findCol(headers, 'hin', 'hull id', 'hull id number', 'hull_id', 'hull identification number', 'vin', 'vin/sn', 'vin/serial', 'serial number', 'hull number', 'hull #');
  if (!hinKey) {
    return NextResponse.json(
      { error: `Could not find HIN column. Found columns: ${headers.join(', ')}`, headers },
      { status: 400 }
    );
  }

  const nameKey = findCol(headers, 'name', 'boat name', 'boat_name', 'vessel name', 'vessel');
  const makeKey = findCol(headers, 'make', 'manufacturer');
  const yearKey = findCol(headers, 'year', 'model year');
  const lengthKey = findCol(headers, 'boat title length', 'length', 'loa');
  const modelKey = findCol(headers, 'model', 'model name');
  const flKey = findCol(headers, 'license plate', 'fl#', 'fl number', 'fl_number', 'registration', 'reg');
  const groupKey = findCol(headers, 'group', 'location', 'home port');
  const idKey = findCol(headers, 'fleetio id', 'id');

  // Extract all data from uploaded file
  const str = (row: Record<string, unknown>, key: string | undefined) =>
    key ? String(row[key] ?? '').trim() : '';

  const fleetioBoats = rows
    .map((row) => ({
      hin: str(row, hinKey).toUpperCase(),
      name: str(row, nameKey),
      make: str(row, makeKey),
      year: str(row, yearKey),
      length: str(row, lengthKey),
      model: str(row, modelKey),
      fl_number: str(row, flKey),
      group: str(row, groupKey),
      fleetio_id: str(row, idKey),
    }))
    .filter((b) => b.hin.length > 0);

  // Get active boats from DB
  const activeBoats = getAllBoats(false);

  const towingByHin = new Map<typeof activeBoats[0], string>();
  for (const boat of activeBoats) {
    const hin = (boat.hin || '').trim().toUpperCase();
    if (hin) towingByHin.set(boat, hin);
  }

  // Reverse lookup: hin -> towing boat
  const towingHinMap = new Map<string, typeof activeBoats[0]>();
  for (const [boat, hin] of towingByHin) {
    towingHinMap.set(hin, boat);
  }

  const fleetioHins = new Set(fleetioBoats.map((b) => b.hin));

  type FleetioInfo = typeof fleetioBoats[0];
  type TowingInfo = { boat_id: string; boat_name: string; make: string; home_port: string; year: number | null; length: string; fl_number: string; expiration: string };

  const toTowingInfo = (b: typeof activeBoats[0]): TowingInfo => ({
    boat_id: b.boat_id,
    boat_name: b.boat_name,
    make: b.make,
    home_port: b.home_port,
    year: b.year,
    length: b.length,
    fl_number: b.fl_number,
    expiration: b.expiration,
  });

  const matched: Array<{ hin: string; towing: TowingInfo; fleetio: FleetioInfo; mismatches: string[] }> = [];
  const towingOnly: Array<{ hin: string } & TowingInfo> = [];
  const fleetioOnly: FleetioInfo[] = [];

  for (const fb of fleetioBoats) {
    const towingBoat = towingHinMap.get(fb.hin);
    if (towingBoat) {
      // Check for mismatches
      const mismatches: string[] = [];
      const tMake = (towingBoat.make || '').trim().toUpperCase();
      const fMake = (fb.make || '').trim().toUpperCase();
      if (tMake && fMake && tMake !== fMake) mismatches.push('make');

      const tYear = towingBoat.year ? String(towingBoat.year) : '';
      const fYear = fb.year || '';
      if (tYear && fYear && tYear !== fYear) mismatches.push('year');

      const tFL = (towingBoat.fl_number || '').trim().toUpperCase();
      const fFL = (fb.fl_number || '').trim().toUpperCase();
      if (tFL && fFL && tFL !== fFL) mismatches.push('fl_number');

      matched.push({
        hin: fb.hin,
        towing: toTowingInfo(towingBoat),
        fleetio: fb,
        mismatches,
      });
    } else {
      fleetioOnly.push(fb);
    }
  }

  for (const [boat, hin] of towingByHin) {
    if (!fleetioHins.has(hin)) {
      towingOnly.push({ hin, ...toTowingInfo(boat) });
    }
  }

  return NextResponse.json({
    summary: {
      fleetioTotal: fleetioBoats.length,
      towingActive: activeBoats.length,
      matched: matched.length,
      towingOnly: towingOnly.length,
      fleetioOnly: fleetioOnly.length,
      withMismatches: matched.filter((m) => m.mismatches.length > 0).length,
    },
    matched,
    towingOnly,
    fleetioOnly,
    hinColumn: hinKey,
  });
}
