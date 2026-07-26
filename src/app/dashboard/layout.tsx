'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink-50)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--color-brand-mid)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[var(--color-ink-500)]">Memeriksa otorisasi akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-ink-50)] text-[var(--color-ink-900)]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
