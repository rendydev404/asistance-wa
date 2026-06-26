'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type KBItem = {
  id: string;
  question: string | null;
  answer: string;
};

export default function KnowledgeList({ initialItems }: { initialItems: KBItem[] }) {
  const [items, setItems] = useState<KBItem[]>(initialItems);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/knowledge/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      
      if (!res.ok) throw new Error('Gagal menambahkan');
      
      const newItem = await res.json();
      setItems([newItem, ...items]);
      setQuestion('');
      setAnswer('');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menambahkan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus fakta ini?')) return;
    
    // Panggil API penghapusan (untuk simplifikasi, bisa panggil supabase di client jika setup anon key, tapi RLS harus allow. Lebih baik via API route).
    // Kita anggap ada route DELETE /api/knowledge/embed?id=xxx
    try {
      await fetch(`/api/knowledge/embed?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Tambah */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-semibold">Tambah Fakta Baru</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan / Topik (Opsional)</label>
          <input 
            type="text" 
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Misal: Berapa harga jasa pembuatan website?"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban / Fakta (Wajib)</label>
          <textarea 
            required
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={3}
            placeholder="Misal: Harga jasa pembuatan website mulai dari Rp 5.000.000 tergantung fitur."
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
        >
          {loading ? 'Memproses AI Embedding...' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Simpan Fakta
            </>
          )}
        </button>
      </form>

      {/* Daftar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertanyaan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fakta / Jawaban</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Belum ada fakta yang disimpan.</td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.question || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.answer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
