'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-semibold text-slate-400 transition hover:bg-red-400/10 hover:text-red-300">
      Keluar
    </button>
  );
}
