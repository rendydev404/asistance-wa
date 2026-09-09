'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, LoaderCircle, QrCode, Smartphone, Wifi, WifiOff } from 'lucide-react';

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
    starting: { label: 'Menghubungkan', icon: LoaderCircle, tone: 'text-amber-200', badge: 'bg-amber-300/12' },
    qr: { label: 'Siap dipindai', icon: QrCode, tone: 'text-cyan-200', badge: 'bg-cyan-300/12' },
    connected: { label: 'Terhubung', icon: Wifi, tone: 'text-teal-200', badge: 'bg-teal-300/12' },
    disconnected: { label: 'Terputus', icon: WifiOff, tone: 'text-red-200', badge: 'bg-red-300/12' },
    error: { label: 'Perlu dicek', icon: WifiOff, tone: 'text-red-200', badge: 'bg-red-300/12' },
  }[state.status];
  const StatusIcon = copy.icon;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-teal-200/12 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_38%),linear-gradient(135deg,#10283b,#0b1728_62%,#101b31)] p-5 shadow-2xl shadow-black/15 sm:p-7" aria-live="polite">
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200"><span className="h-2 w-2 animate-pulse rounded-full bg-teal-300" /> WhatsApp gateway</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Koneksi perangkat</h2>
          <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${copy.tone} ${copy.badge}`}><StatusIcon className={`h-4 w-4 ${state.status === 'starting' ? 'animate-spin' : ''}`} aria-hidden="true" /> {copy.label}</p>
          {state.phone_number && (
            <p className="mt-3 text-sm text-slate-300">Nomor aktif <span className="font-semibold text-white">{state.phone_number}</span></p>
          )}
        </div>
        {state.status === 'connected' && <div className="flex items-center gap-2 text-xs font-medium text-teal-200"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Siap menerima pesan</div>}
      </div>

      {state.status === 'qr' && state.qr && (
        <div className="relative mt-7 grid gap-6 rounded-3xl border border-white/10 bg-slate-950/25 p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5">
          <div className="mx-auto rounded-2xl bg-white p-3 shadow-2xl shadow-cyan-950/30"><Image src={state.qr} alt="QR code untuk menautkan WhatsApp" width={256} height={256} unoptimized className="h-56 w-56 sm:h-64 sm:w-64" /></div>
          <div className="sm:pr-5"><p className="flex items-center gap-2 text-sm font-semibold text-white"><Smartphone className="h-4 w-4 text-cyan-200" aria-hidden="true" /> Tautkan dari WhatsApp</p><p className="mt-2 text-sm leading-6 text-slate-400">Buka WhatsApp di ponsel, masuk ke <span className="text-slate-200">Perangkat tertaut</span>, lalu pilih <span className="text-slate-200">Tautkan perangkat</span>.</p><p className="mt-4 text-xs font-medium text-cyan-200">QR berganti otomatis jika kedaluwarsa.</p></div>
        </div>
      )}

      {state.status === 'starting' && (
        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin text-amber-200" aria-hidden="true" /> Bot sedang mulai. QR akan muncul otomatis di sini.</div>
      )}

      {(state.status === 'disconnected' || state.status === 'error') && state.last_error && (
        <p className="mt-6 break-words rounded-2xl border border-red-300/15 bg-red-300/8 p-4 text-sm leading-6 text-red-100">{state.last_error}</p>
      )}
    </section>
  );
}
