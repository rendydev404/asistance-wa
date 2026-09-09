'use client';

import { useState } from 'react';
import { Bot, Check, LoaderCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PersonaForm({ initialPrompt }: { initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'system_prompt', value: prompt }),
      });
      
      if (!res.ok) throw new Error('Gagal menyimpan');
      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-[2rem] border border-white/8 bg-[#0e1c2d] p-5 shadow-xl shadow-black/10 sm:p-7">
      <div>
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-300/12 text-indigo-200"><Bot className="h-5 w-5" aria-hidden="true" /></span><div><label className="block text-lg font-semibold text-white" htmlFor="system-prompt">Instruksi untuk AI</label><p className="mt-1 text-sm leading-6 text-slate-400">Tulis aturan yang harus diikuti. Gunakan <code className="rounded-lg bg-slate-950/60 px-1.5 py-0.5 text-xs text-indigo-200">{'{context}'}</code> agar AI membaca fakta yang relevan.</p></div></div>
        <textarea 
          id="system-prompt"
          required
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={10}
          className="mt-6 min-h-64 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 font-mono text-sm leading-6 text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-indigo-300/60"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><button 
        type="submit" 
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        {loading ? 'Menyimpan...' : 'Simpan perubahan'}
      </button>{saved && <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-200"><Check className="h-4 w-4" aria-hidden="true" /> Tersimpan</span>}</div>
    </form>
  );
}
