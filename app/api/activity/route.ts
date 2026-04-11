import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db';

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
  return NextResponse.json(getRecentActivity(limit));
}
