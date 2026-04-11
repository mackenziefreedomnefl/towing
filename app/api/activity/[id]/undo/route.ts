import { NextRequest, NextResponse } from 'next/server';
import { undoActivity } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = undoActivity(parseInt(id));
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
