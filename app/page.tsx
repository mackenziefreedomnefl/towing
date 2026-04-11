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

// JC boats without BT# use a different towing provider
function isAltProvider(boat: Boat) {
  return boat.boat_id.startsWith('JCE-') || boat.boat_id.startsWith('JCW-');
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [allBoats, setAllBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('All');

  useEffect(() => {
    fetch('/api/boats').then(r => r.json()).then(data => {
      setAllBoats(data);
      setLoading(false);
    });
  }, []);

  const locations = useMemo(() => {
    const ports = new Set(allBoats.map(b => b.home_port || 'Unknown'));
    return ['All', ...Array.from(ports).sort()];
  }, [allBoats]);

  const filtered = useMemo(() => {
    let result = allBoats;
    if (locationFilter !== 'All') {
      result = result.filter(b => (b.home_port || 'Unknown') === locationFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(b =>
        b.boat_id.toLowerCase().includes(q) ||
        b.boat_name.toLowerCase().includes(q) ||
        b.fl_number.toLowerCase().includes(q) ||
        b.hin.toLowerCase().includes(q) ||
        b.make.toLowerCase().includes(q) ||
        b.home_port.toLowerCase().includes(q) ||
        (b.year && String(b.year).includes(q)) ||
        b.length.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allBoats, query, locationFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Boat[]> = {};
    for (const boat of filtered) {
      const port = boat.home_port || 'Unknown';
      if (!groups[port]) groups[port] = [];
      groups[port].push(boat);
    }
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
            <h1 className="text-lg font-bold text-gray-800">FBC NEFL TOWING</h1>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Admin
          </Link>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-3 text-xs text-gray-500">
          Have ready: Lat/Long &nbsp;&#8226;&nbsp; # on board &nbsp;&#8226;&nbsp; Member contact # &nbsp;&#8226;&nbsp; Create an incident report
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
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
            <div className="flex flex-wrap gap-2 mt-3">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    locationFilter === loc
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {loc}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 self-center">
                {filtered.length} of {allBoats.length} boats
              </span>
            </div>
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
              {boats.map((boat) => {
                const jc = isAltProvider(boat);
                return (
                  <div
                    key={boat.id}
                    className={`rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
                      jc ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {boat.boat_name}
                        </h3>
                        <p className={`font-mono font-bold text-lg ${jc ? 'text-red-600' : 'text-blue-600'}`}>
                          {boat.boat_id.startsWith('JC') ? boat.fl_number || boat.boat_id : boat.boat_id}
                        </p>
                      </div>
                      {boat.expiration ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          new Date(boat.expiration) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(boat.expiration) > new Date() ? 'Active' : 'Expired'}
                        </span>
                      ) : jc ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          BoatUS
                        </span>
                      ) : null}
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
                    {/* Contact info in the card */}
                    <div className={`mt-4 rounded-lg p-3 text-center ${
                      jc ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {jc ? (
                        <>
                          <p className="text-xs font-bold uppercase tracking-wide">BoatUS — No Membership — Club Pays Out of Pocket</p>
                          <a href="tel:3866756231" className="text-2xl font-bold tracking-wider hover:underline">
                            (386) 675-6231
                          </a>
                          <p className="text-xs mt-1 font-semibold opacity-90">Notify Ops Management Before Calling for Tow</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium uppercase tracking-wide opacity-90">BMC Towing — Contact: Rob ({new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true })} his time)</p>
                          <a href="tel:6199296743" className="text-2xl font-bold tracking-wider hover:underline">
                            619-929-6743
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Freedom Boat Club &mdash; Towing Membership
      </footer>
    </div>
  );
}
