'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setBoats([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/boats?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setBoats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

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
        <div className="bg-blue-600 text-white rounded-xl p-6 mb-8 text-center shadow-lg">
          <p className="text-sm font-medium uppercase tracking-wide opacity-90 mb-1">
            BMC Towing - Call to Request a Tow
          </p>
          <a
            href="tel:6199296743"
            className="text-4xl font-bold tracking-wider hover:underline"
          >
            619-929-6743
          </a>
          <p className="text-sm opacity-75 mt-2">Rob - San Diego</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">Search boats</label>
          <input
            id="search"
            type="text"
            placeholder="Search by boat name, BT number, FL#, or HIN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm bg-white"
            autoFocus
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-8 text-gray-500">Searching...</div>
        )}

        {!loading && query && boats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No boats found for &ldquo;{query}&rdquo;
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-12 text-gray-400">
            <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-lg">Type to search for a boat</p>
            <p className="text-sm mt-1">Search by name, BT number, FL#, or HIN</p>
          </div>
        )}

        <div className="space-y-4">
          {boats.map((boat) => (
            <div
              key={boat.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {boat.boat_name}
                  </h2>
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
                <div>
                  <span className="text-gray-500 block">Home Port</span>
                  <span className="font-medium">{boat.home_port || '—'}</span>
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Freedom Boat Club &mdash; BMC Towing Membership
      </footer>
    </div>
  );
}
