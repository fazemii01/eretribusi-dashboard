'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ShieldAlert,
  HelpCircle,
  LogOut,
  Leaf,
  ChevronDown,
  UserCheck,
  FileCheck,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>('admin');
  const [username, setUsername] = useState<string>('Admin DLH');
  const [retribusiOpen, setRetribusiOpen] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') || 'admin';
    const savedUser = localStorage.getItem('username') || 'Admin DLH';
    setRole(savedRole.toLowerCase());
    setUsername(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const isKetua = role === 'ketua';
  const isAdmin = role === 'admin' || isKetua;

  return (
    <aside className="w-64 bg-[var(--color-sidebar-bg)] text-white flex flex-col h-screen sticky top-0 shrink-0 border-r border-[var(--color-sidebar-border)] z-40">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[var(--color-sidebar-border)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-mid)] flex items-center justify-center text-white">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-tight text-white leading-none">E-Retribusi</h3>
          <span className="text-[10px] text-[var(--color-sidebar-text)] tracking-wider uppercase block mt-1">
            DLH Lumajang
          </span>
        </div>
      </div>

      {/* User Profile Pill */}
      <div className="px-4 py-4 border-b border-[var(--color-sidebar-border)]">
        <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-wash)]/10 text-[var(--color-brand-light)] flex items-center justify-center font-bold text-sm border border-[var(--color-brand-light)]/20 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] text-[var(--color-sidebar-text)] uppercase tracking-wider block">
              Selamat datang,
            </span>
            <p className="text-xs font-bold text-white truncate capitalize">{username}</p>
            <span className="inline-block text-[10px] font-bold text-[var(--color-brand-light)] uppercase tracking-wider bg-[var(--color-brand-mid)]/20 px-2 py-0.5 rounded-md mt-0.5">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isAdmin && (
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              pathname === '/dashboard'
                ? 'bg-[var(--color-sidebar-active-bg)] text-white'
                : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        )}

        <Link
          href="/dashboard/pelanggan"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            pathname === '/dashboard/pelanggan'
              ? 'bg-[var(--color-sidebar-active-bg)] text-white'
              : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Data Pelanggan
        </Link>

        {/* Retribusi Dropdown */}
        <div>
          <button
            onClick={() => setRetribusiOpen(!retribusiOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Manajemen Retribusi</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${retribusiOpen ? 'rotate-180' : ''}`} />
          </button>

          {retribusiOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/dashboard/tagihan"
                className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  pathname === '/dashboard/tagihan'
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-[var(--color-sidebar-text)] hover:text-white'
                }`}
              >
                Riwayat & Loket
              </Link>

              <Link
                href="/dashboard/invoice"
                className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  pathname === '/dashboard/invoice'
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-[var(--color-sidebar-text)] hover:text-white'
                }`}
              >
                Bukti Tanda Terima (Invoice)
              </Link>
            </div>
          )}
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/pengaturan"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              pathname === '/dashboard/pengaturan'
                ? 'bg-[var(--color-sidebar-active-bg)] text-white'
                : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan Pembayaran
          </Link>
        )}

        {isKetua && (
          <>
            <Link
              href="/dashboard/tarif"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/dashboard/tarif'
                  ? 'bg-[var(--color-sidebar-active-bg)] text-white'
                  : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              Pengaturan Tarif
            </Link>

            <Link
              href="/dashboard/user"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/dashboard/user'
                  ? 'bg-[var(--color-sidebar-active-bg)] text-white'
                  : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Manajemen User
            </Link>
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-[var(--color-sidebar-border)] mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-red-500 text-[var(--color-sidebar-text)] hover:text-white text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
