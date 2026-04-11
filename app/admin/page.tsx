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

interface ActivityEntry {
  id: number;
  action: string;
  boat_id: string;
  boat_name: string;
  details: string;
  created_at: string;
}

const emptyBoat: Omit<Boat, 'id'> = {
  boat_id: '', hin: '', fl_number: '', boat_name: '', make: '',
  home_port: '', year: null, length: '', annual_dues: null,
  active: '', renewed: '', transfer: '', expiration: '',
};

function BoatForm({
  boat,
  onSave,
  onCancel,
  title,
}: {
  boat: Omit<Boat, 'id'> & { id?: number };
  onSave: (b: Omit<Boat, 'id'> & { id?: number }) => void;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState(boat);
  const set = (field: string, value: string | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boat ID (BT#)</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.boat_id} onChange={(e) => set('boat_id', e.target.value)} placeholder="BT10827" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boat Name</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.boat_name} onChange={(e) => set('boat_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HIN</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.hin} onChange={(e) => set('hin', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FL#</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.fl_number} onChange={(e) => set('fl_number', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.make} onChange={(e) => set('make', e.target.value)} placeholder="Key West" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Port</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.home_port} onChange={(e) => set('home_port', e.target.value)} placeholder="Beach Marine" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.length} onChange={(e) => set('length', e.target.value)} placeholder={`23' 9"`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Dues</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.annual_dues ?? ''} onChange={(e) => set('annual_dues', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Date</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="date" value={form.active} onChange={(e) => set('active', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renewed Date</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="date" value={form.renewed} onChange={(e) => set('renewed', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="date" value={form.expiration} onChange={(e) => set('expiration', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.transfer} onChange={(e) => set('transfer', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function PasscodeGate({ onAuth }: { onAuth: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: code }),
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('admin_auth', 'true');
      onAuth();
    } else {
      setError('Invalid passcode');
      setCode('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <Image src="/FBCLogoCMYK.png" alt="Freedom Boat Club" width={160} height={50} className="h-10 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Enter passcode to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="Passcode"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">
            Enter
          </button>
        </form>
        <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
          &larr; Back to Search
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Boat | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Boat | null>(null);
  const [tab, setTab] = useState<'boats' | 'activity'>('boats');

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setAuthed(true);
  }, []);

  const load = useCallback(async () => {
    const url = search ? `/api/boats?q=${encodeURIComponent(search)}` : '/api/boats';
    const res = await fetch(url);
    setBoats(await res.json());
  }, [search]);

  const loadActivity = useCallback(async () => {
    const res = await fetch('/api/activity');
    setActivity(await res.json());
  }, []);

  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load, authed]);

  useEffect(() => {
    if (authed && tab === 'activity') loadActivity();
  }, [authed, tab, loadActivity]);

  async function handleAdd(boat: Omit<Boat, 'id'>) {
    await fetch('/api/boats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat),
    });
    setAdding(false);
    load();
    loadActivity();
  }

  async function handleEdit(boat: Omit<Boat, 'id'> & { id?: number }) {
    if (!boat.id) return;
    await fetch(`/api/boats/${boat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat),
    });
    setEditing(null);
    load();
    loadActivity();
  }

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/boats/${deleting.id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
    loadActivity();
  }

  if (!authed) return <PasscodeGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/FBCLogoCMYK.png" alt="Freedom Boat Club" width={160} height={50} className="h-10 w-auto" priority />
            <span className="text-lg font-semibold text-gray-700">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}
              className="text-sm text-gray-400 hover:text-gray-600 font-medium"
            >
              Lock
            </button>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              &larr; Back to Search
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 max-w-xs">
          <button
            onClick={() => setTab('boats')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'boats' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Boats
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'activity' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity
          </button>
        </div>

        {tab === 'boats' && (
          <>
            <div className="flex items-center justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Filter boats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 max-w-md px-4 py-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
              <button
                onClick={() => setAdding(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                + Add Boat
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">BT#</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Boat Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">FL#</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Make</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Home Port</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Year</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Length</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Expires</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boats.map((boat) => (
                    <tr key={boat.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-medium text-blue-600">{boat.boat_id}</td>
                      <td className="px-3 py-2 font-medium">{boat.boat_name}</td>
                      <td className="px-3 py-2">{boat.fl_number}</td>
                      <td className="px-3 py-2">{boat.make}</td>
                      <td className="px-3 py-2">{boat.home_port}</td>
                      <td className="px-3 py-2">{boat.year}</td>
                      <td className="px-3 py-2">{boat.length}</td>
                      <td className="px-3 py-2">
                        {boat.expiration && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            new Date(boat.expiration) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {boat.expiration}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditing(boat)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Edit
                          </button>
                          <button onClick={() => setDeleting(boat)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {boats.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400">No boats found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4">{boats.length} boats total</p>
          </>
        )}

        {tab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500">Changes made to the towing list</p>
            </div>
            {activity.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400">No activity yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activity.map((entry) => (
                  <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
                    <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                      entry.action === 'Added' ? 'bg-green-100 text-green-700' :
                      entry.action === 'Edited' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.action}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.boat_name} <span className="text-gray-400 font-mono text-xs">{entry.boat_id}</span>
                      </p>
                      {entry.details && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.details}</p>
                      )}
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(entry.created_at + 'Z').toLocaleString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {adding && (
        <BoatForm
          boat={emptyBoat}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
          title="Add New Boat"
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <BoatForm
          boat={editing}
          onSave={handleEdit}
          onCancel={() => setEditing(null)}
          title={`Edit ${editing.boat_name}`}
        />
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-2">Delete Boat</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove <strong>{deleting.boat_name}</strong> ({deleting.boat_id})?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
