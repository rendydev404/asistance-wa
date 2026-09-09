'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Exclusion = {
  id: string;
  phrase: string;
  match_type: 'contains' | 'exact' | 'starts_with';
  action: 'silent' | 'human';
  active: boolean;
};

const matchLabels = {
  contains: 'Mengandung frasa',
  exact: 'Sama persis',
  starts_with: 'Diawali frasa',
};

const actionLabels = {
  silent: 'AI diam',
  human: 'Alihkan ke human',
};

export default function ExclusionManager({ initialItems }: { initialItems: Exclusion[] }) {
  const [items, setItems] = useState(initialItems);
  const [phrase, setPhrase] = useState('');
  const [matchType, setMatchType] = useState<Exclusion['match_type']>('contains');
  const [action, setAction] = useState<Exclusion['action']>('silent');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addRule = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, match_type: matchType, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan aturan');
      setItems([result, ...items]);
      setPhrase('');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menyimpan aturan');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (item: Exclusion) => {
    const response = await fetch('/api/exclusions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (!response.ok) return;
    setItems(items.map((current) => current.id === item.id ? { ...current, active: !current.active } : current));
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Hapus aturan pengecualian ini?')) return;
    const response = await fetch(`/api/exclusions?id=${id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setItems(items.filter((item) => item.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addRule} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Tambah pengecualian</h3>
          <p className="text-sm text-gray-500 mt-1">Pesan yang cocok tidak akan dijawab oleh AI.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kata atau frasa</label>
          <input required maxLength={200} value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="Contoh: komplain, refund, atau alamat kantor" className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">Cara cocok
            <select value={matchType} onChange={(event) => setMatchType(event.target.value as Exclusion['match_type'])} className="mt-1 w-full border border-gray-300 rounded-md p-2 font-normal">
              {Object.entries(matchLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">Jika cocok
            <select value={action} onChange={(event) => setAction(event.target.value as Exclusion['action'])} className="mt-1 w-full border border-gray-300 rounded-md p-2 font-normal">
              {Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
          <Plus className="w-4 h-4 mr-2" />{loading ? 'Menyimpan...' : 'Simpan aturan'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Aturan aktif</h3></div>
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? <p className="p-6 text-sm text-gray-500">Belum ada pengecualian.</p> : items.map((item) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className={`font-medium ${item.active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{item.phrase}</p>
                <p className="text-xs text-gray-500 mt-1">{matchLabels[item.match_type]} · {actionLabels[item.action]}</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleRule(item)} className={`text-sm ${item.active ? 'text-green-600' : 'text-gray-400'}`}>{item.active ? 'Aktif' : 'Nonaktif'}</button>
                <button type="button" onClick={() => deleteRule(item.id)} className="text-red-600 hover:text-red-800" aria-label="Hapus aturan"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
