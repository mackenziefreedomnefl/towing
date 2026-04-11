'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Boat {
  id: number;
  boat_id: string;
  hin: string;
  fl_number: string;
  boat_name: string;
  make: string;
  home_port: string;
  year: number | null;
  length: string;
  annual_dues: number | null;
  active: string;
  renewed: string;
  transfer: string;
  expiration: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [allBoats, setAllBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/boats').then(r => r.json()).then(data => {
      setAllBoats(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allBoats;
    const q = query.toLowerCase();
    return allBoats.filter(b =>
      b.boat_id.toLowerCase().includes(q) ||
      b.boat_name.toLowerCase().includes(q) ||
      b.fl_number.toLowerCase().includes(q) ||
      b.hin.toLowerCase().includes(q) ||
      b.make.toLowerCase().includes(q) ||
      b.home_port.toLowerCase().includes(q) ||
      (b.year && String(b.year).includes(q)) ||
      b.length.toLowerCase().includes(q)
    );
  }, [allBoats, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Boat[]> = {};
    for (const boat of filtered) {
      const port = boat.home_port || 'Unknown';
      if (!groups[port]) groups[port] = [];
      groups[port].push(boat);
    }
    // Sort locations alphabetically
    const sorted: [string, Boat[]][] = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [filtered]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/FBCLogoCMYK.png"
              alt="Freedom Boat Club"
              width={160}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Phone Banner */}
        <div className="bg-blue-600 text-white rounded-xl p-6 mb-6 text-center shadow-lg">
          <p className="text-sm font-medium uppercase tracking-wide opacity-90 mb-1">
            BMC Towing - Call to Request a Tow
          </p>
          <a
            href="tel:6199296743"
            className="text-4xl font-bold tracking-wider hover:underline"
          >
            619-929-6743
          </a>
          <p className="text-sm opacity-75 mt-2">Contact: Rob (California time)</p>
        </div>

        {/* Call Checklist */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm">
          <p className="font-semibold text-amber-800 mb-2">Before calling, have ready:</p>
          <ul className="space-y-1 text-amber-700">
            <li>&#8226; Lat/Long of the vessel</li>
            <li>&#8226; Number of people on board</li>
            <li>&#8226; Contact number for the member on board</li>
          </ul>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">Search boats</label>
          <input
            id="search"
            type="text"
            placeholder="Search by boat name, BT number, FL#, HIN, make, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm bg-white"
            autoFocus
          />
          {!loading && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {filtered.length} of {allBoats.length} boats
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading boats...</div>
        )}

        {!loading && query && filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No boats found for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Grouped by location */}
        {!loading && grouped.map(([location, boats]) => (
          <div key={location} className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 py-2 px-1 -mx-1 z-10 border-b border-gray-200">
              {location} <span className="text-gray-400 font-normal">({boats.length})</span>
            </h2>
            <div className="space-y-3">
              {boats.map((boat) => (
                <div
                  key={boat.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {boat.boat_name}
                      </h3>
                      <p className="text-blue-600 font-mono font-bold text-lg">
                        {boat.boat_id}
                      </p>
                    </div>
                    {boat.expiration && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        new Date(boat.expiration) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {new Date(boat.expiration) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">FL#</span>
                      <span className="font-medium">{boat.fl_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">HIN</span>
                      <span className="font-medium font-mono text-xs">{boat.hin || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Make</span>
                      <span className="font-medium">{boat.make || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Length</span>
                      <span className="font-medium">{boat.length || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Year</span>
                      <span className="font-medium">{boat.year || '—'}</span>
                    </div>
                    {boat.expiration && (
                      <div>
                        <span className="text-gray-500 block">Expires</span>
                        <span className="font-medium">{boat.expiration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Freedom Boat Club &mdash; BMC Towing Membership
      </footer>
    </div>
  );
}
