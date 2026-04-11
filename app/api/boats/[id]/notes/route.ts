import { NextRequest, NextResponse } from 'next/server';
import { getBoatNotes, addNote, getBoat } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = getBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(getBoatNotes(boat.boat_id));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = getBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { author, note } = await request.json();
  const entry = addNote(boat.boat_id, author || 'Admin', note);
  return NextResponse.json(entry, { status: 201 });
}
