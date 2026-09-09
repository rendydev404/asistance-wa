'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  const router = useRouter();

  const addNumber = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
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
      alert(error instanceof Error ? error.message : 'Gagal menyimpan nomor');
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
    <div className="space-y-6">
      <form onSubmit={addNumber} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Tambah nomor pengecualian</h3>
          <p className="text-sm text-gray-500 mt-1">Pesan dari nomor ini tidak akan dijawab otomatis oleh AI.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
          <input required type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Contoh: 081234567890 atau +6281234567890" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-500 mt-1">Format 08, 62, atau +62 didukung.</p>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
          <Plus className="w-4 h-4 mr-2" />{loading ? 'Menyimpan...' : 'Blokir AI untuk nomor ini'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Daftar nomor yang tidak dijawab AI</h3></div>
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? <p className="p-6 text-sm text-gray-500">Belum ada nomor.</p> : items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className={`font-medium ${item.active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>+{item.phone_number}</p>
                <p className="text-xs text-gray-500 mt-1">{item.active ? 'AI tidak akan menjawab' : 'Pengecualian nonaktif'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleNumber(item)} className={`text-sm ${item.active ? 'text-green-600' : 'text-gray-400'}`}>{item.active ? 'Aktif' : 'Nonaktif'}</button>
                <button type="button" onClick={() => deleteNumber(item.id)} className="text-red-600 hover:text-red-800" aria-label="Hapus nomor"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
