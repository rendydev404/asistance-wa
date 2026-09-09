'use client';

import { useState } from 'react';
import { Ban, Check, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ExcludedContact = {
  id: string;
  phone_number: string;
  active: boolean;
};

export default function ExclusionManager({ initialItems }: { initialItems: ExcludedContact[] }) {
  const [items, setItems] = useState(initialItems);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const addNumber = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan nomor');
      setItems([result, ...items.filter((item) => item.id !== result.id)]);
      setPhoneNumber('');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menyimpan nomor');
    } finally {
      setLoading(false);
    }
  };

  const toggleNumber = async (item: ExcludedContact) => {
    const response = await fetch('/api/exclusions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (!response.ok) return;
    setItems(items.map((current) => current.id === item.id ? { ...current, active: !current.active } : current));
  };

  const deleteNumber = async (id: string) => {
    if (!confirm('Hapus nomor dari daftar pengecualian?')) return;
    const response = await fetch(`/api/exclusions?id=${id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setItems(items.filter((item) => item.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={addNumber} className="rounded-[2rem] border border-amber-200/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.1),rgba(14,28,45,0.96)_48%)] p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-300/12 text-amber-200"><Ban className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-lg font-semibold text-white">Tambah nomor</h2><p className="mt-1 text-sm leading-5 text-slate-400">AI akan diam untuk nomor ini sampai pengecualiannya dimatikan.</p></div></div>
        <div className="mt-6"><label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="excluded-phone">Nomor WhatsApp</label><input id="excluded-phone" required type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="0812 3456 7890" className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-amber-200/60" /><p className="mt-2 text-xs text-slate-500">Bisa ditulis 08..., 62..., atau +62...</p></div>
        {error && <p className="mt-4 rounded-2xl border border-red-300/15 bg-red-300/8 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{loading ? 'Menyimpan...' : 'Lewati nomor ini'}
        </button>
      </form>

      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1c2d]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><div><h2 className="font-semibold text-white">Daftar pengecualian</h2><p className="mt-1 text-xs text-slate-500">{items.filter((item) => item.active).length} nomor sedang dilewati</p></div><Check className="h-5 w-5 text-teal-300" aria-hidden="true" /></div>
        <div className="divide-y divide-white/8">
          {items.length === 0 ? <p className="p-6 text-sm text-slate-500">Belum ada nomor. Tambahkan nomor admin atau pelanggan yang perlu ditangani manual.</p> : items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-5">
              <div>
                <p className={`font-semibold tracking-wide ${item.active ? 'text-white' : 'text-slate-500 line-through'}`}>+{item.phone_number}</p>
                <p className="mt-1 text-xs text-slate-500">{item.active ? 'AI tidak menjawab nomor ini' : 'Pengecualian sedang nonaktif'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleNumber(item)} className={`min-h-11 rounded-xl px-3 text-xs font-bold transition ${item.active ? 'bg-teal-300/12 text-teal-200 hover:bg-teal-300/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{item.active ? 'Aktif' : 'Nonaktif'}</button>
                <button type="button" onClick={() => deleteNumber(item.id)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-400/10 hover:text-red-300" aria-label={`Hapus nomor ${item.phone_number}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
