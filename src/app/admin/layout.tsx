import Link from 'next/link';
import { Home, BookOpen, Settings, MessageSquare } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-800">WA AI Admin</h1>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/knowledge" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
            <BookOpen className="w-5 h-5" />
            <span>Knowledge Base</span>
          </Link>
          <Link href="/admin/persona" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
            <Settings className="w-5 h-5" />
            <span>Persona & Settings</span>
          </Link>
          <Link href="/admin/logs" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md">
            <MessageSquare className="w-5 h-5" />
            <span>Chat Logs</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
