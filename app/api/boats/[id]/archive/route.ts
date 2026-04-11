import { NextRequest, NextResponse } from 'next/server';
import { archiveBoat, unarchiveBoat } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = archiveBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(boat);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = unarchiveBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(boat);
}
