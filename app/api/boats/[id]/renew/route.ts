import { NextRequest, NextResponse } from 'next/server';
import { renewBoat } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const boat = renewBoat(parseInt(id));
  if (!boat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(boat);
}
