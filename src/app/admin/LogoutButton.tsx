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
    <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">
      Keluar
    </button>
  );
}
