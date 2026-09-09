'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bot, LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error('Password salah atau autentikasi belum dikonfigurasi.');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-4 py-8 sm:px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0e1c2d] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-slate-950"><Bot className="h-6 w-6" aria-hidden="true" /></span>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Asist WA</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Masuk ke console</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Kelola koneksi WhatsApp dan aturan balasan AI dari sini.</p>
        </div>
        <label className="mt-7 block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200"><LockKeyhole className="h-4 w-4 text-teal-200" aria-hidden="true" /> Password admin</span><input
          autoFocus
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-white placeholder:text-slate-600 outline-none transition focus:border-teal-300/60"
          placeholder="Password admin"
        /></label>
        {error && <p className="mt-4 rounded-2xl border border-red-300/15 bg-red-300/8 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
        <button disabled={loading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-teal-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Memeriksa...' : 'Masuk ke dashboard'}{!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </main>
  );
}
