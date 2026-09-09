'use client';

import { useState } from 'react';
import { BookOpen, Check, LoaderCircle, Plus, Trash2 } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Form Tambah */}
      <form onSubmit={handleAdd} className="rounded-[2rem] border border-white/8 bg-[#0e1c2d] p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-300/12 text-indigo-200"><BookOpen className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-lg font-semibold text-white">Tambah fakta</h2><p className="mt-1 text-sm leading-5 text-slate-400">Tulis satu informasi yang bisa langsung dirujuk AI.</p></div></div>
        
        <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="knowledge-question">Pertanyaan atau topik <span className="font-normal text-slate-500">(opsional)</span></label>
          <input 
            id="knowledge-question"
            type="text" 
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Contoh: Berapa harga pembuatan website?"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-300/60"
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="knowledge-answer">Jawaban atau fakta <span className="font-normal text-rose-300">(wajib)</span></label>
          <textarea 
            id="knowledge-answer"
            required
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={3}
            placeholder="Contoh: Harga mulai dari Rp5.000.000, tergantung fitur yang dipilih."
            className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-600 outline-none transition focus:border-indigo-300/60"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Menyimpan fakta...</> : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" /> Simpan fakta
            </>
          )}
        </button>
        </div>
      </form>

      {/* Daftar */}
      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1c2d]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-white">Fakta tersimpan</h2><p className="mt-1 text-xs text-slate-500">{items.length} item tersedia untuk AI</p></div><Check className="h-5 w-5 text-indigo-300" aria-hidden="true" /></div>
        <div className="divide-y divide-white/8 md:hidden">
          {items.length === 0 ? <p className="p-6 text-sm text-slate-500">Belum ada fakta. Tambahkan yang pertama di atas.</p> : items.map((item) => (
            <article key={item.id} className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-indigo-300">{item.question || 'Fakta umum'}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.answer}</p></div><button onClick={() => handleDelete(item.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-400/10 hover:text-red-300" aria-label="Hapus fakta"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></article>
          ))}
        </div>
        <table className="hidden min-w-full divide-y divide-white/8 md:table">
          <thead className="bg-white/4">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pertanyaan</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fakta / Jawaban</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada fakta yang disimpan.</td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-5 text-sm text-slate-200">{item.question || '-'}</td>
                <td className="max-w-xl whitespace-pre-wrap px-6 py-5 text-sm leading-6 text-slate-300">{item.answer}</td>
                <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-medium">
                  <button onClick={() => handleDelete(item.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-red-400/10 hover:text-red-300" aria-label="Hapus fakta">
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
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
