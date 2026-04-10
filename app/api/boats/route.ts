import { NextRequest, NextResponse } from 'next/server';
import { getAllBoats, searchBoats, createBoat } from '@/lib/db';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const boats = q ? searchBoats(q) : getAllBoats();
  return NextResponse.json(boats);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const boat = createBoat(body);
  return NextResponse.json(boat, { status: 201 });
}
