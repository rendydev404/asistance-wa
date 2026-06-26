'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PersonaForm({ initialPrompt }: { initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'system_prompt', value: prompt }),
      });
      
      if (!res.ok) throw new Error('Gagal menyimpan');
      alert('Pengaturan berhasil disimpan!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt AI
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Gunakan variabel <code>{'{context}'}</code> di dalam teks untuk memberitahu AI di mana ia harus meletakkan konteks fakta dari Knowledge Base.
        </p>
        <textarea 
          required
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={10}
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </form>
  );
}
