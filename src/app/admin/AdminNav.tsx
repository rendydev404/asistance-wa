'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, MessageSquare, Settings, ShieldAlert } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Ringkasan', shortLabel: 'Home', icon: Home },
  { href: '/admin/knowledge', label: 'Knowledge', shortLabel: 'Data AI', icon: BookOpen },
  { href: '/admin/persona', label: 'Persona', shortLabel: 'Persona', icon: Settings },
  { href: '/admin/logs', label: 'Chat logs', shortLabel: 'Log', icon: MessageSquare },
  { href: '/admin/exclusions', label: 'Pengecualian', shortLabel: 'Blokir', icon: ShieldAlert },
];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden gap-2 md:flex md:flex-col" aria-label="Navigasi utama">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-300 text-slate-950 shadow-[0_8px_24px_rgba(129,140,248,0.2)]'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-3xl border border-white/12 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden"
        aria-label="Navigasi mobile"
      >
        {items.map(({ href, shortLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-semibold transition ${
                active ? 'bg-indigo-300 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
