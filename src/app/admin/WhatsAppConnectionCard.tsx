'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ConnectionState = {
  status: 'starting' | 'qr' | 'connected' | 'disconnected' | 'error';
  qr: string | null;
  phone_number: string | null;
  last_error: string | null;
  updated_at: string | null;
};

const initialState: ConnectionState = {
  status: 'starting',
  qr: null,
  phone_number: null,
  last_error: null,
  updated_at: null,
};

export default function WhatsAppConnectionCard() {
  const [state, setState] = useState<ConnectionState>(initialState);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch('/api/whatsapp/status', { cache: 'no-store' });
        if (!response.ok) return;
        const nextState = (await response.json()) as ConnectionState;
        if (active) setState(nextState);
      } catch {
        // The next poll will retry while the bot is starting.
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const copy = {
    starting: { label: 'Menghubungkan...', color: 'text-amber-600' },
    qr: { label: 'Menunggu scan QR', color: 'text-blue-600' },
    connected: { label: 'Terhubung', color: 'text-green-600' },
    disconnected: { label: 'Terputus', color: 'text-red-600' },
    error: { label: 'Error', color: 'text-red-600' },
  }[state.status];

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Koneksi WhatsApp</h3>
          <p className={`mt-1 font-medium ${copy.color}`}>{copy.label}</p>
          {state.phone_number && (
            <p className="text-sm text-gray-500 mt-1">Nomor: {state.phone_number}</p>
          )}
        </div>
        <span className={`h-3 w-3 rounded-full ${state.status === 'connected' ? 'bg-green-500' : state.status === 'qr' ? 'bg-blue-500' : 'bg-amber-500'}`} />
      </div>

      {state.status === 'qr' && state.qr && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <Image src={state.qr} alt="QR code WhatsApp" width={256} height={256} unoptimized className="w-64 h-64 border rounded-lg" />
          <p className="text-sm text-gray-600 text-center">
            Buka WhatsApp → Perangkat tertaut → Tautkan perangkat, lalu scan QR ini.
          </p>
        </div>
      )}

      {state.status === 'starting' && (
        <p className="text-sm text-gray-500 mt-4">Bot sedang memulai koneksi. QR akan muncul otomatis.</p>
      )}

      {(state.status === 'disconnected' || state.status === 'error') && state.last_error && (
        <p className="text-sm text-red-600 mt-4 break-words">{state.last_error}</p>
      )}
    </section>
  );
}
