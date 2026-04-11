import { NextRequest, NextResponse } from 'next/server';
import { getAllBoats, getRecentActivity } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') || 'csv';

  const activeBoats = getAllBoats(false);
  const allBoats = getAllBoats(true);
  const archivedBoats = allBoats.filter(b => b.archived === 1);
  const activity = getRecentActivity(500);

  const boatHeaders = ['BT#', 'Boat Name', 'HIN', 'FL#', 'Make', 'Home Port', 'Year', 'Length', 'Rate', 'Active', 'Renewed', 'Transfer', 'Expiration'];
  const boatToRow = (b: typeof activeBoats[0]) => [
    b.boat_id, b.boat_name, b.hin, b.fl_number, b.make, b.home_port,
    b.year, b.length, b.annual_dues, b.active, b.renewed, b.transfer, b.expiration,
  ];

  const activityHeaders = ['Date', 'Action', 'BT#', 'Boat Name', 'Details'];
  const activityToRow = (a: typeof activity[0]) => [
    a.created_at, a.action, a.boat_id, a.boat_name, a.details,
  ];

  if (format === 'csv') {
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      '--- ACTIVE BOATS ---',
      boatHeaders.map(escape).join(','),
      ...activeBoats.map(b => boatToRow(b).map(escape).join(',')),
      '',
      '--- ARCHIVED BOATS ---',
      boatHeaders.map(escape).join(','),
      ...archivedBoats.map(b => boatToRow(b).map(escape).join(',')),
      '',
      '--- ACTIVITY LOG ---',
      activityHeaders.map(escape).join(','),
      ...activity.map(a => activityToRow(a).map(escape).join(',')),
    ];
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="towing-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  // Excel (xlsx)
  const wb = XLSX.utils.book_new();

  const activeData = [boatHeaders, ...activeBoats.map(boatToRow)];
  const wsActive = XLSX.utils.aoa_to_sheet(activeData);
  wsActive['!cols'] = boatHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsActive, 'Active');

  const archivedData = [boatHeaders, ...archivedBoats.map(boatToRow)];
  const wsArchived = XLSX.utils.aoa_to_sheet(archivedData);
  wsArchived['!cols'] = boatHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsArchived, 'Archived');

  const activityData = [activityHeaders, ...activity.map(activityToRow)];
  const wsActivity = XLSX.utils.aoa_to_sheet(activityData);
  wsActivity['!cols'] = activityHeaders.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsActivity, 'Activity Log');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="towing-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}
