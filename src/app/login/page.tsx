'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">WA AI Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan password admin untuk melanjutkan.</p>
        </div>
        <input
          autoFocus
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Password admin"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}
