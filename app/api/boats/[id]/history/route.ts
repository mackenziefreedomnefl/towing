import { NextRequest, NextResponse } from 'next/server';
import { getBoatHistory, getBoat } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = getBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(getBoatHistory(boat.boat_id));
}
