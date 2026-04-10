import { NextRequest, NextResponse } from 'next/server';
import { getBoat, updateBoat, deleteBoat } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = getBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(boat);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const boat = updateBoat(parseInt(id), body);
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(boat);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteBoat(parseInt(id));
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
