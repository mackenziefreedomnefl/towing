import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '2026';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json();
  if (passcode === ADMIN_PASSCODE) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
}
