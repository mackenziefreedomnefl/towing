'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  archived: number;
}

interface ActivityEntry {
  id: number;
  action: string;
  boat_id: string;
  boat_name: string;
  details: string;
  undone: number;
  created_at: string;
}

interface BoatNote {
  id: number;
  boat_id: string;
  author: string;
  note: string;
  created_at: string;
}

const emptyBoat: Omit<Boat, 'id' | 'archived'> = {
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
  boat: Omit<Boat, 'id' | 'archived'> & { id?: number };
  onSave: (b: Omit<Boat, 'id' | 'archived'> & { id?: number }) => void;
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
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

function TransferModal({
  boat,
  onSave,
  onCancel,
}: {
  boat: Boat;
  onSave: (oldBoat: Boat, newBoat: Omit<Boat, 'id' | 'archived'>, note: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    boat_id: boat.boat_id,
    hin: '',
    fl_number: '',
    boat_name: '',
    make: boat.make,
    home_port: boat.home_port,
    year: boat.year,
    length: '',
    annual_dues: boat.annual_dues,
    active: boat.active,
    renewed: boat.renewed,
    transfer: `From ${boat.boat_id}`,
    expiration: boat.expiration,
  });
  const [note, setNote] = useState('');
  const set = (field: string, value: string | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold mb-1">Transfer Boat</h2>
        <p className="text-sm text-gray-500 mb-4">
          Transferring <strong>{boat.boat_id}</strong> ({boat.boat_name}). Update the boat info below. BT# usually stays the same.
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500">
          <span className="font-semibold">Old:</span> {boat.boat_id} &mdash; {boat.boat_name} &mdash; {boat.fl_number} &mdash; {boat.make} {boat.length} ({boat.year})
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BT Number</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.boat_id} onChange={(e) => set('boat_id', e.target.value)} placeholder="BT10999" />
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
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.make} onChange={(e) => set('make', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Port</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.home_port} onChange={(e) => set('home_port', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.length} onChange={(e) => set('length', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.annual_dues ?? ''} onChange={(e) => set('annual_dues', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="date" value={form.expiration} onChange={(e) => set('expiration', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for transfer, what changed..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave(boat, form, note)} disabled={!form.boat_id.trim()} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50">Transfer</button>
        </div>
      </div>
    </div>
  );
}

function BoatDetailPanel({
  boat,
  onClose,
  onRefresh,
}: {
  boat: Boat;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [notes, setNotes] = useState<BoatNote[]>([]);
  const [history, setHistory] = useState<ActivityEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetch(`/api/boats/${boat.id}/notes`).then(r => r.json()).then(setNotes);
    fetch(`/api/boats/${boat.id}/history`).then(r => r.json()).then(setHistory);
  }, [boat.id]);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    await fetch(`/api/boats/${boat.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: author || 'Admin', note: newNote }),
    });
    setNewNote('');
    const res = await fetch(`/api/boats/${boat.id}/notes`);
    setNotes(await res.json());
    onRefresh();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{boat.boat_name}</h2>
            <p className="text-blue-600 font-mono font-bold">{boat.boat_id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm mb-6 bg-gray-50 rounded-lg p-4">
          <div><span className="text-gray-500 block">FL#</span><span className="font-medium">{boat.fl_number || '—'}</span></div>
          <div><span className="text-gray-500 block">HIN</span><span className="font-medium font-mono text-xs">{boat.hin || '—'}</span></div>
          <div><span className="text-gray-500 block">Make</span><span className="font-medium">{boat.make || '—'}</span></div>
          <div><span className="text-gray-500 block">Length</span><span className="font-medium">{boat.length || '—'}</span></div>
          <div><span className="text-gray-500 block">Year</span><span className="font-medium">{boat.year || '—'}</span></div>
          <div><span className="text-gray-500 block">Home Port</span><span className="font-medium">{boat.home_port || '—'}</span></div>
        </div>

        {/* Add Note */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Note</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-32 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={handleAddNote} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add</button>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes ({notes.length})</h3>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400">No notes yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900">{n.author}</span>
                    <time className="text-xs text-gray-400">{new Date(n.created_at + 'Z').toLocaleString()}</time>
                  </div>
                  <p className="text-gray-700 mt-1">{n.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Change History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No history</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-2 text-sm py-1">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    h.action === 'Added' ? 'bg-green-100 text-green-700' :
                    h.action === 'Edited' ? 'bg-blue-100 text-blue-700' :
                    h.action === 'Archived' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{h.action}</span>
                  <span className="text-gray-600 flex-1 truncate">{h.details}</span>
                  <time className="text-xs text-gray-400 whitespace-nowrap">{new Date(h.created_at + 'Z').toLocaleString()}</time>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ARCHIVE_REASONS = [
  'Non-transferable Membership',
  'Boat Received Tow',
  'Boat Removed From Fleet',
  'Opting Out of Program',
  'Other',
] as const;

function ArchiveModal({
  boat,
  onArchive,
  onCancel,
}: {
  boat: Boat;
  onArchive: (reason: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState('');
  const [otherText, setOtherText] = useState('');

  const reason = selected === 'Other' ? `Other: ${otherText}` : selected;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold mb-1">Archive Boat</h2>
        <p className="text-sm text-gray-500 mb-4">
          Why is <strong>{boat.boat_name}</strong> ({boat.boat_id}) being archived?
        </p>
        <div className="space-y-2 mb-4">
          {ARCHIVE_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selected === r ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="reason"
                value={r}
                checked={selected === r}
                onChange={() => setSelected(r)}
                className="accent-yellow-600"
              />
              <span className="text-sm font-medium text-gray-700">{r}</span>
            </label>
          ))}
          {selected === 'Other' && (
            <input
              type="text"
              placeholder="Please specify..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 ml-6"
              autoFocus
            />
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => onArchive(reason)}
            disabled={!selected || (selected === 'Other' && !otherText.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditEditForm({
  towing,
  fleetio,
  onSave,
  onCancel,
}: {
  towing: { id: number; boat_id: string; boat_name: string; hin: string; fl_number: string; make: string; home_port: string; year: number | null; length: string; annual_dues: number | null; active: string; renewed: string; transfer: string; expiration: string };
  fleetio: { name: string; fl_number: string; make: string; year: string; length: string; model: string; group: string };
  onSave: (b: Omit<Boat, 'id' | 'archived'> & { id?: number }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...towing });
  const set = (field: string, value: string | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Helper: show Fleetio value as clickable hint if different
  const hint = (towingVal: string | number | null, fleetioVal: string, field: string) => {
    const tStr = String(towingVal ?? '').trim().toUpperCase();
    const fStr = fleetioVal.trim().toUpperCase();
    if (!fStr || tStr === fStr) return null;
    return (
      <button
        type="button"
        onClick={() => {
          // For year field, parse as number
          if (field === 'year') {
            set(field, fleetioVal ? parseInt(fleetioVal) : null);
          } else {
            set(field, fleetioVal);
          }
        }}
        className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded px-1 py-0.5 mt-0.5 block truncate max-w-full"
        title={`Click to use Fleetio value: ${fleetioVal}`}
      >
        Fleetio: {fleetioVal}
      </button>
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Boat ID (BT#)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" value={form.boat_id} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Boat Name</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.boat_name} onChange={(e) => set('boat_name', e.target.value)} />
          {hint(towing.boat_name, fleetio.name, 'boat_name')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HIN</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" value={form.hin} readOnly />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">FL#</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.fl_number} onChange={(e) => set('fl_number', e.target.value)} />
          {hint(towing.fl_number, fleetio.fl_number, 'fl_number')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.make} onChange={(e) => set('make', e.target.value)} />
          {hint(towing.make, fleetio.make, 'make')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Port</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.home_port} onChange={(e) => set('home_port', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value ? parseInt(e.target.value) : null)} />
          {hint(towing.year, fleetio.year, 'year')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.length} onChange={(e) => set('length', e.target.value)} />
          {hint(towing.length, fleetio.length, 'length')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" value={form.annual_dues ?? ''} onChange={(e) => set('annual_dues', e.target.value ? parseInt(e.target.value) : null)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" type="date" value={form.expiration} onChange={(e) => set('expiration', e.target.value)} />
        </div>
      </div>
      {/* Fleetio reference info */}
      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700">
        <span className="font-semibold">Fleetio reference:</span> {fleetio.name} — {fleetio.make} {fleetio.model} ({fleetio.year}) — {fleetio.length} — FL# {fleetio.fl_number} — {fleetio.group}
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
        <button onClick={() => onSave({ ...form, id: towing.id })} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
      </div>
    </>
  );
}

function AuditAddModal({
  fleetio,
  allBoats,
  onAdd,
  onCancel,
}: {
  fleetio: { hin: string; name: string; make: string; year: string; length: string; model: string; fl_number: string; group: string };
  allBoats: Boat[];
  onAdd: (boat: Omit<Boat, 'id' | 'archived'>, existingId?: number) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [btNumber, setBtNumber] = useState('');
  const [homePort, setHomePort] = useState('');
  const [existingSearch, setExistingSearch] = useState('');
  const [selectedExisting, setSelectedExisting] = useState<Boat | null>(null);

  // Parse Fleetio name — strip FL# suffix
  const cleanName = fleetio.name.replace(/\s*-\s*FL\w+$/, '').replace(/^\(\d+\)\s*/, '').trim();

  // Determine location from Fleetio group
  const groupLower = fleetio.group.toLowerCase();
  const defaultPort = groupLower.includes('mandarin') ? 'Julington Creek West'
    : groupLower.includes('julington') ? 'Julington Creek East'
    : groupLower.includes('jax beach') ? 'Beach Marine'
    : groupLower.includes('augustine') || groupLower.includes('camachee') ? 'Camachee Cove'
    : '';

  const filteredExisting = existingSearch.trim()
    ? allBoats.filter(b => {
        const q = existingSearch.toLowerCase();
        return b.boat_id.toLowerCase().includes(q) ||
          b.boat_name.toLowerCase().includes(q) ||
          b.hin.toLowerCase().includes(q) ||
          b.fl_number.toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  function handleSubmit() {
    const boatData: Omit<Boat, 'id' | 'archived'> = {
      boat_id: mode === 'existing' && selectedExisting ? selectedExisting.boat_id : (btNumber.trim() || `JC-${fleetio.fl_number}`),
      hin: fleetio.hin,
      fl_number: fleetio.fl_number,
      boat_name: cleanName,
      make: fleetio.make,
      home_port: homePort || defaultPort,
      year: fleetio.year ? parseInt(fleetio.year) : null,
      length: fleetio.length,
      annual_dues: null,
      active: '',
      renewed: '',
      transfer: mode === 'existing' && selectedExisting ? `From ${selectedExisting.boat_id}` : '',
      expiration: mode === 'existing' && selectedExisting ? selectedExisting.expiration : '',
    };
    onAdd(boatData, mode === 'existing' && selectedExisting ? selectedExisting.id : undefined);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold mb-1">Add Boat from Fleetio</h2>
        {/* Fleetio info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700 mb-4">
          <span className="font-semibold">Fleetio:</span> {fleetio.name} — {fleetio.make} ({fleetio.year}) — HIN: {fleetio.hin} — FL# {fleetio.fl_number}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('new'); setSelectedExisting(null); }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border ${mode === 'new' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500'}`}
          >
            Add as New Boat
          </button>
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border ${mode === 'existing' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-200 text-gray-500'}`}
          >
            Update Existing BT#
          </button>
        </div>

        {mode === 'new' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BT Number</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={btNumber}
                onChange={(e) => setBtNumber(e.target.value)}
                placeholder="Leave blank for BoatUS (no membership) card"
              />
              <p className="text-xs text-gray-400 mt-1">Enter a BT# for BMC Towing coverage, or leave blank for a BoatUS (red) card</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Port</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={homePort || defaultPort}
                onChange={(e) => setHomePort(e.target.value)}
                placeholder="Beach Marine"
              />
            </div>
          </div>
        )}

        {mode === 'existing' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search for existing boat to update</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={existingSearch}
                onChange={(e) => setExistingSearch(e.target.value)}
                placeholder="Search by BT#, name, HIN, FL#..."
                autoFocus
              />
            </div>
            {filteredExisting.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {filteredExisting.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedExisting(b); setExistingSearch(''); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${selectedExisting?.id === b.id ? 'bg-blue-50' : ''}`}
                  >
                    <span className="font-mono font-medium text-blue-600">{b.boat_id}</span>
                    <span className="ml-2">{b.boat_name}</span>
                    <span className="ml-2 text-gray-400 text-xs">{b.hin}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedExisting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-blue-800 mb-1">Will update this boat with Fleetio info:</p>
                <p className="text-blue-700">{selectedExisting.boat_id} — {selectedExisting.boat_name} — HIN: {selectedExisting.hin} — FL# {selectedExisting.fl_number}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={mode === 'existing' && !selectedExisting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {mode === 'existing' ? 'Update Boat' : (btNumber.trim() ? 'Add with BT#' : 'Add as BoatUS')}
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
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">Enter</button>
        </form>
        <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">&larr; Back to Search</Link>
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
  const [transferring, setTransferring] = useState<Boat | null>(null);
  const [viewing, setViewing] = useState<Boat | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<Boat | null>(null);
  const [tab, setTab] = useState<'boats' | 'archived' | 'activity' | 'audit'>('boats');
  const [sortCol, setSortCol] = useState<string>('boat_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [boatNotes, setBoatNotes] = useState<Record<number, BoatNote[]>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [newNoteText, setNewNoteText] = useState<Record<number, string>>({});
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  interface FleetioInfo { hin: string; name: string; make: string; year: string; length: string; model: string; fl_number: string; group: string; fleetio_id: string }
  interface TowingInfo { id: number; boat_id: string; boat_name: string; make: string; home_port: string; year: number | null; length: string; fl_number: string; expiration: string; hin: string; annual_dues: number | null; active: string; renewed: string; transfer: string }
  const [auditResult, setAuditResult] = useState<{
    summary: { fleetioTotal: number; towingActive: number; matched: number; towingOnly: number; fleetioOnly: number; withMismatches: number };
    matched: Array<{ hin: string; towing: TowingInfo; fleetio: FleetioInfo; mismatches: string[] }>;
    towingOnly: TowingInfo[];
    fleetioOnly: FleetioInfo[];
    hinColumn: string;
  } | null>(null);
  const [auditUploading, setAuditUploading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditEditing, setAuditEditing] = useState<{ towing: TowingInfo; fleetio: FleetioInfo } | null>(null);
  const [auditAdding, setAuditAdding] = useState<FleetioInfo | null>(null);
  const [lastAuditFile, setLastAuditFile] = useState<File | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setAuthed(true);
  }, []);

  const load = useCallback(async () => {
    const includeArchived = tab === 'archived';
    const url = search
      ? `/api/boats?q=${encodeURIComponent(search)}&archived=${includeArchived}`
      : `/api/boats?archived=${includeArchived}`;
    const res = await fetch(url);
    const data = await res.json();
    if (tab === 'archived') {
      setBoats(data.filter((b: Boat) => b.archived === 1));
    } else {
      setBoats(data.filter((b: Boat) => b.archived === 0));
    }
  }, [search, tab]);

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

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  const sortedBoats = useMemo(() => {
    return [...boats].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortCol];
      const bVal = (b as unknown as Record<string, unknown>)[sortCol];
      const aStr = aVal == null ? '' : String(aVal);
      const bStr = bVal == null ? '' : String(bVal);
      const aNum = Number(aStr);
      const bNum = Number(bStr);
      let cmp: number;
      if (!isNaN(aNum) && !isNaN(bNum) && aStr !== '' && bStr !== '') {
        cmp = aNum - bNum;
      } else {
        cmp = aStr.localeCompare(bStr);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [boats, sortCol, sortDir]);

  async function loadNotesFor(boatId: number) {
    const res = await fetch(`/api/boats/${boatId}/notes`);
    const notes = await res.json();
    setBoatNotes(prev => ({ ...prev, [boatId]: notes }));
  }

  function toggleNotes(boatId: number) {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(boatId)) {
        next.delete(boatId);
      } else {
        next.add(boatId);
        loadNotesFor(boatId);
      }
      return next;
    });
  }

  async function handleAddNote(boatId: number, btNumber: string) {
    const text = newNoteText[boatId];
    if (!text?.trim()) return;
    await fetch(`/api/boats/${boatId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: newNoteAuthor || 'Admin', note: text }),
    });
    setNewNoteText(prev => ({ ...prev, [boatId]: '' }));
    loadNotesFor(boatId);
  }

  async function handleAdd(boat: Omit<Boat, 'id' | 'archived'>) {
    await fetch('/api/boats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat),
    });
    setAdding(false);
    load();
  }

  async function handleEdit(boat: Omit<Boat, 'id' | 'archived'> & { id?: number }) {
    if (!boat.id) return;
    await fetch(`/api/boats/${boat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat),
    });
    setEditing(null);
    load();
  }

  async function handleArchive(reason: string) {
    if (!archiveConfirm) return;
    await fetch(`/api/boats/${archiveConfirm.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    setArchiveConfirm(null);
    load();
  }

  async function handleUnarchive(boat: Boat) {
    await fetch(`/api/boats/${boat.id}/archive`, { method: 'DELETE' });
    load();
  }

  async function handleRenew(boat: Boat) {
    if (!confirm(`Renew ${boat.boat_name} (${boat.boat_id})?\n\nThis will extend the expiration by 1 year.`)) return;
    await fetch(`/api/boats/${boat.id}/renew`, { method: 'POST' });
    load();
  }

  async function handleUndo(activityId: number) {
    const res = await fetch(`/api/activity/${activityId}/undo`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      loadActivity();
      load();
    } else {
      alert(data.message);
    }
  }

  async function handleRedo(activityId: number) {
    const res = await fetch(`/api/activity/${activityId}/redo`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      loadActivity();
      load();
    } else {
      alert(data.message);
    }
  }

  async function handleTransfer(oldBoat: Boat, newBoat: Omit<Boat, 'id' | 'archived'>, note: string) {
    // Build a change summary
    const fields = ['boat_id', 'boat_name', 'hin', 'fl_number', 'make', 'home_port', 'year', 'length', 'annual_dues', 'expiration'] as const;
    const changes: string[] = [];
    const oldRec = oldBoat as unknown as Record<string, unknown>;
    const newRec = newBoat as unknown as Record<string, unknown>;
    for (const f of fields) {
      if (String(oldRec[f] ?? '') !== String(newRec[f] ?? '')) {
        changes.push(`${f}: ${oldRec[f] || '—'} → ${newRec[f] || '—'}`);
      }
    }
    const changeSummary = changes.length > 0 ? changes.join(', ') : 'No field changes';

    const sameBT = newBoat.boat_id.trim() === oldBoat.boat_id.trim();

    if (sameBT) {
      // Same BT# — update the existing boat in place
      await fetch(`/api/boats/${oldBoat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBoat, transfer: newBoat.transfer || `Transfer ${new Date().toISOString().split('T')[0]}` }),
      });
      // Add transfer note with old info
      await fetch(`/api/boats/${oldBoat.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'System',
          note: `Transfer (same BT#). Old info: ${oldBoat.boat_name}, HIN: ${oldBoat.hin}, FL#: ${oldBoat.fl_number}, Make: ${oldBoat.make}, Length: ${oldBoat.length}, Year: ${oldBoat.year}. Changes: ${changeSummary}${note ? '. ' + note : ''}`,
        }),
      });
    } else {
      // Different BT# — archive old, create new
      await fetch(`/api/boats/${oldBoat.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Transferred to ${newBoat.boat_id}` }),
      });
      await fetch(`/api/boats/${oldBoat.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'System',
          note: `Transferred to ${newBoat.boat_id}. Changes: ${changeSummary}${note ? '. ' + note : ''}`,
        }),
      });
      await fetch('/api/boats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoat),
      });
    }
    setTransferring(null);
    load();
  }

  async function handleAuditUpload(file: File) {
    setAuditUploading(true);
    setAuditError('');
    setAuditResult(null);
    setLastAuditFile(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/audit', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setAuditError(data.error || 'Upload failed');
      } else {
        setAuditResult(data);
      }
    } catch {
      setAuditError('Failed to upload file');
    } finally {
      setAuditUploading(false);
    }
  }

  async function handleAuditEdit(boat: Omit<Boat, 'id' | 'archived'> & { id?: number }) {
    if (!boat.id) return;
    await fetch(`/api/boats/${boat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boat),
    });
    setAuditEditing(null);
    if (lastAuditFile) handleAuditUpload(lastAuditFile);
  }

  async function handleAuditAdd(boatData: Omit<Boat, 'id' | 'archived'>, existingId?: number) {
    if (existingId) {
      // Update existing boat with new Fleetio info
      await fetch(`/api/boats/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boatData),
      });
    } else {
      // Create new boat
      await fetch('/api/boats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boatData),
      });
    }
    setAuditAdding(null);
    load();
    if (lastAuditFile) handleAuditUpload(lastAuditFile);
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
          <div className="flex items-center gap-3">
            <a href="/api/export?format=xlsx" className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">Excel</a>
            <a href="/api/export?format=csv" className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">CSV</a>
            <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }} className="text-sm text-gray-400 hover:text-gray-600 font-medium">Lock</button>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">&larr; Back to Search</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 max-w-md">
          {(['boats', 'archived', 'activity', 'audit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {(tab === 'boats' || tab === 'archived') && (
          <>
            <div className="flex items-center justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Filter boats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 max-w-md px-4 py-2 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
              {tab === 'boats' && (
                <button onClick={() => setAdding(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 whitespace-nowrap">+ Add Boat</button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {[
                      { key: 'boat_id', label: 'BT#' },
                      { key: 'boat_name', label: 'Boat Name' },
                      { key: 'fl_number', label: 'FL#' },
                      { key: 'make', label: 'Make' },
                      { key: 'home_port', label: 'Home Port' },
                      { key: 'year', label: 'Year' },
                      { key: 'length', label: 'Length' },
                      { key: 'annual_dues', label: 'Rate' },
                      { key: 'expiration', label: 'Expires' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-3 text-left font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900 whitespace-nowrap"
                        onClick={() => handleSort(key)}
                      >
                        {label}
                        {sortCol === key && (
                          <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                        )}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Notes</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBoats.map((boat) => (
                    <React.Fragment key={boat.id}>
                      <tr className={`border-b border-gray-100 hover:bg-gray-50 ${boat.archived ? 'opacity-60' : ''}`}>
                        <td className="px-3 py-2">
                          <button onClick={() => setViewing(boat)} className="font-mono font-medium text-blue-600 hover:underline">{boat.boat_id}</button>
                        </td>
                        <td className="px-3 py-2 font-medium">{boat.boat_name}</td>
                        <td className="px-3 py-2">{boat.fl_number}</td>
                        <td className="px-3 py-2">{boat.make}</td>
                        <td className="px-3 py-2">{boat.home_port}</td>
                        <td className="px-3 py-2">{boat.year}</td>
                        <td className="px-3 py-2">{boat.length}</td>
                        <td className="px-3 py-2">{boat.annual_dues ? `$${boat.annual_dues}` : '—'}</td>
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
                          <button
                            onClick={() => toggleNotes(boat.id)}
                            className={`text-xs font-medium ${expandedNotes.has(boat.id) ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {expandedNotes.has(boat.id) ? 'Hide' : 'Show'}
                            {boatNotes[boat.id]?.length ? ` (${boatNotes[boat.id].length})` : ''}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => setEditing(boat)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                            {tab === 'boats' ? (
                              <>
                                <button onClick={() => handleRenew(boat)} className="text-green-600 hover:text-green-800 text-xs font-medium">Renew</button>
                                <button onClick={() => setTransferring(boat)} className="text-orange-600 hover:text-orange-800 text-xs font-medium">Transfer</button>
                                <button onClick={() => setArchiveConfirm(boat)} className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">Archive</button>
                              </>
                            ) : (
                              <button onClick={() => handleUnarchive(boat)} className="text-green-600 hover:text-green-800 text-xs font-medium">Restore</button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedNotes.has(boat.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={11} className="px-4 py-3">
                            <div className="max-w-2xl">
                              {/* Add note inline */}
                              <div className="flex gap-2 mb-3">
                                <input
                                  type="text"
                                  placeholder="Your name"
                                  value={newNoteAuthor}
                                  onChange={(e) => setNewNoteAuthor(e.target.value)}
                                  className="w-28 border rounded px-2 py-1.5 text-xs"
                                />
                                <input
                                  type="text"
                                  placeholder="Add a note..."
                                  value={newNoteText[boat.id] || ''}
                                  onChange={(e) => setNewNoteText(prev => ({ ...prev, [boat.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote(boat.id, boat.boat_id)}
                                  className="flex-1 border rounded px-2 py-1.5 text-xs"
                                />
                                <button
                                  onClick={() => handleAddNote(boat.id, boat.boat_id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                  Add
                                </button>
                              </div>
                              {/* Notes list */}
                              {(!boatNotes[boat.id] || boatNotes[boat.id].length === 0) ? (
                                <p className="text-xs text-gray-400">No notes yet</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {boatNotes[boat.id].map((n) => (
                                    <div key={n.id} className="text-xs bg-white rounded border border-gray-200 px-3 py-2">
                                      <span className="font-semibold text-gray-700">{n.author}</span>
                                      <span className="text-gray-400 ml-2">{new Date(n.created_at + 'Z').toLocaleString()}</span>
                                      <p className="text-gray-600 mt-0.5">{n.note}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {boats.length === 0 && (
                    <tr><td colSpan={11} className="px-3 py-8 text-center text-gray-400">{tab === 'archived' ? 'No archived boats' : 'No boats found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4">{boats.length} boats</p>
          </>
        )}

        {tab === 'audit' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Fleetio Audit</h2>
              <p className="text-sm text-gray-500 mb-4">Upload a Fleetio export (CSV or Excel) to match boats by HIN against the towing list.</p>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  {auditUploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    disabled={auditUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAuditUpload(f);
                      e.target.value = '';
                    }}
                  />
                </label>
                {auditResult && (
                  <button onClick={() => { setAuditResult(null); setAuditError(''); }} className="text-sm text-gray-500 hover:text-gray-700">Clear Results</button>
                )}
              </div>
              {auditError && <p className="text-sm text-red-600 mt-3">{auditError}</p>}
            </div>

            {/* Results */}
            {auditResult && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{auditResult.summary.fleetioTotal}</div>
                    <div className="text-xs text-gray-500 mt-1">Fleetio Boats</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{auditResult.summary.towingActive}</div>
                    <div className="text-xs text-gray-500 mt-1">Towing Active</div>
                  </div>
                  <div className="bg-white rounded-xl border border-green-300 bg-green-50 p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{auditResult.summary.matched}</div>
                    <div className="text-xs text-green-600 mt-1">Matched</div>
                  </div>
                  <div className="bg-white rounded-xl border border-orange-300 bg-orange-50 p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">{auditResult.summary.withMismatches}</div>
                    <div className="text-xs text-orange-600 mt-1">Mismatches</div>
                  </div>
                  <div className="bg-white rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{auditResult.summary.towingOnly}</div>
                    <div className="text-xs text-yellow-600 mt-1">Towing Only</div>
                  </div>
                  <div className="bg-white rounded-xl border border-red-300 bg-red-50 p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">{auditResult.summary.fleetioOnly}</div>
                    <div className="text-xs text-red-600 mt-1">Fleetio Only</div>
                  </div>
                </div>

                <p className="text-xs text-gray-400">Matched on column: <strong>{auditResult.hinColumn}</strong></p>

                {/* Matched — with side-by-side comparison */}
                {auditResult.matched.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-3 border-b border-gray-200 bg-green-50">
                      <h3 className="text-sm font-semibold text-green-800">
                        Matched — In Both Systems ({auditResult.matched.length})
                        {auditResult.summary.withMismatches > 0 && (
                          <span className="ml-2 text-orange-600 font-normal">({auditResult.summary.withMismatches} with mismatches)</span>
                        )}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">HIN</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">BT#</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-600 border-l border-blue-200 bg-blue-50/50">Towing Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-600 bg-purple-50/50">Fleetio Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-600 bg-blue-50/50">Towing FL#</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-600 bg-purple-50/50">Fleetio FL#</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-600 bg-blue-50/50">Towing Make</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-600 bg-purple-50/50">Fleetio Make</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-600 bg-blue-50/50">Towing Year</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-600 bg-purple-50/50">Fleetio Year</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Length</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Model</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditResult.matched.map((m, i) => {
                            const hasMismatch = m.mismatches.length > 0;
                            const mm = new Set(m.mismatches);
                            return (
                              <tr key={i} className={`border-b border-gray-100 ${hasMismatch ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}>
                                <td className="px-3 py-2 font-mono text-xs">{m.hin}</td>
                                <td className="px-3 py-2 font-mono font-medium text-blue-600">{m.towing.boat_id}</td>
                                <td className="px-3 py-2 border-l border-blue-100">{m.towing.boat_name}</td>
                                <td className="px-3 py-2 text-gray-500">{m.fleetio.name}</td>
                                <td className={`px-3 py-2 ${mm.has('fl_number') ? 'bg-orange-100 font-semibold text-orange-800' : ''}`}>{m.towing.fl_number}</td>
                                <td className={`px-3 py-2 ${mm.has('fl_number') ? 'bg-orange-100 font-semibold text-orange-800' : 'text-gray-500'}`}>{m.fleetio.fl_number}</td>
                                <td className={`px-3 py-2 ${mm.has('make') ? 'bg-orange-100 font-semibold text-orange-800' : ''}`}>{m.towing.make}</td>
                                <td className={`px-3 py-2 ${mm.has('make') ? 'bg-orange-100 font-semibold text-orange-800' : 'text-gray-500'}`}>{m.fleetio.make}</td>
                                <td className={`px-3 py-2 ${mm.has('year') ? 'bg-orange-100 font-semibold text-orange-800' : ''}`}>{m.towing.year}</td>
                                <td className={`px-3 py-2 ${mm.has('year') ? 'bg-orange-100 font-semibold text-orange-800' : 'text-gray-500'}`}>{m.fleetio.year}</td>
                                <td className="px-3 py-2 text-gray-500">{m.fleetio.length}</td>
                                <td className="px-3 py-2 text-gray-500">{m.fleetio.model}</td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => setAuditEditing({ towing: m.towing, fleetio: m.fleetio })}
                                    className={`text-xs font-medium px-2 py-1 rounded ${hasMismatch ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    {hasMismatch ? 'Fix' : 'Edit'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Towing Only */}
                {auditResult.towingOnly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-3 border-b border-gray-200 bg-yellow-50">
                      <h3 className="text-sm font-semibold text-yellow-800">Towing Only — Not in Fleetio ({auditResult.towingOnly.length})</h3>
                      <p className="text-xs text-yellow-600 mt-0.5">These boats have towing coverage but were not found in the Fleetio export.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">HIN</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">BT#</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Boat Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">FL#</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Make</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Home Port</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Year</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Length</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Expires</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditResult.towingOnly.map((b, i) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-yellow-50">
                              <td className="px-4 py-2 font-mono text-xs">{b.hin}</td>
                              <td className="px-4 py-2 font-mono font-medium">{b.boat_id}</td>
                              <td className="px-4 py-2">{b.boat_name}</td>
                              <td className="px-4 py-2">{b.fl_number}</td>
                              <td className="px-4 py-2">{b.make}</td>
                              <td className="px-4 py-2">{b.home_port}</td>
                              <td className="px-4 py-2">{b.year}</td>
                              <td className="px-4 py-2">{b.length}</td>
                              <td className="px-4 py-2">{b.expiration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fleetio Only — full details */}
                {auditResult.fleetioOnly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-3 border-b border-gray-200 bg-red-50">
                      <h3 className="text-sm font-semibold text-red-800">Fleetio Only — Not in Towing List ({auditResult.fleetioOnly.length})</h3>
                      <p className="text-xs text-red-600 mt-0.5">These boats are in Fleetio but do not have towing coverage.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">HIN</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Fleetio Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">FL#</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Make</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Year</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Length</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Model</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Group</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditResult.fleetioOnly.map((b, i) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-red-50">
                              <td className="px-4 py-2 font-mono text-xs">{b.hin}</td>
                              <td className="px-4 py-2">{b.name}</td>
                              <td className="px-4 py-2">{b.fl_number}</td>
                              <td className="px-4 py-2">{b.make}</td>
                              <td className="px-4 py-2">{b.year}</td>
                              <td className="px-4 py-2">{b.length}</td>
                              <td className="px-4 py-2">{b.model}</td>
                              <td className="px-4 py-2 text-xs">{b.group}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => setAuditAdding(b)}
                                  className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  Add
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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
                {activity.map((entry) => {
                  const created = new Date(entry.created_at + 'Z');
                  const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
                  const canUndoRedo = daysSince <= 7 && entry.action !== 'Undo' && entry.action !== 'Redo';
                  return (
                    <div key={entry.id} className={`px-5 py-3 flex items-start gap-3 ${entry.undone ? 'opacity-50' : ''}`}>
                      <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                        entry.action === 'Added' ? 'bg-green-100 text-green-700' :
                        entry.action === 'Edited' ? 'bg-blue-100 text-blue-700' :
                        entry.action === 'Renewed' ? 'bg-emerald-100 text-emerald-700' :
                        entry.action === 'Archived' ? 'bg-yellow-100 text-yellow-700' :
                        entry.action === 'Unarchived' ? 'bg-purple-100 text-purple-700' :
                        entry.action === 'Undo' ? 'bg-gray-200 text-gray-600' :
                        entry.action === 'Redo' ? 'bg-gray-200 text-gray-600' :
                        'bg-red-100 text-red-700'
                      }`}>{entry.action}{entry.undone ? ' (undone)' : ''}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.boat_name} <span className="text-gray-400 font-mono text-xs">{entry.boat_id}</span>
                        </p>
                        {entry.details && <p className="text-xs text-gray-500 mt-0.5">{entry.details}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {canUndoRedo && !entry.undone && (
                          <button onClick={() => handleUndo(entry.id)} className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-0.5 hover:bg-red-50">
                            Undo
                          </button>
                        )}
                        {canUndoRedo && entry.undone === 1 && (
                          <button onClick={() => handleRedo(entry.id)} className="text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50">
                            Redo
                          </button>
                        )}
                        <time className="text-xs text-gray-400 whitespace-nowrap">{created.toLocaleString()}</time>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {adding && <BoatForm boat={emptyBoat} onSave={handleAdd} onCancel={() => setAdding(false)} title="Add New Boat" />}

      {/* Edit Modal */}
      {editing && <BoatForm boat={editing} onSave={handleEdit} onCancel={() => setEditing(null)} title={`Edit ${editing.boat_name}`} />}

      {/* Transfer Modal */}
      {transferring && <TransferModal boat={transferring} onSave={handleTransfer} onCancel={() => setTransferring(null)} />}

      {/* Boat Detail / Notes Panel */}
      {viewing && <BoatDetailPanel boat={viewing} onClose={() => setViewing(null)} onRefresh={load} />}

      {/* Archive Confirmation */}
      {archiveConfirm && (
        <ArchiveModal
          boat={archiveConfirm}
          onArchive={(reason) => handleArchive(reason)}
          onCancel={() => setArchiveConfirm(null)}
        />
      )}

      {/* Audit Edit Modal — pre-filled with towing data, shows Fleetio values for reference */}
      {auditEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-1">Reconcile Mismatch</h2>
            <p className="text-sm text-gray-500 mb-4">
              Edit <strong>{auditEditing.towing.boat_id}</strong> to match Fleetio. Fleetio values shown in purple for reference.
            </p>
            <AuditEditForm
              towing={auditEditing.towing}
              fleetio={auditEditing.fleetio}
              onSave={handleAuditEdit}
              onCancel={() => setAuditEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Audit Add Modal */}
      {auditAdding && (
        <AuditAddModal
          fleetio={auditAdding}
          allBoats={boats}
          onAdd={handleAuditAdd}
          onCancel={() => setAuditAdding(null)}
        />
      )}
    </div>
  );
}
