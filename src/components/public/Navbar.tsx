'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogIn, Menu, X, FileText, Home } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/tagihan', label: 'Lihat Tagihan', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--color-ink-100)] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-wash)] flex items-center justify-center text-[var(--color-brand-mid)] border border-[var(--color-brand-light)]/20 transition-transform group-hover:scale-105">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--color-brand-deep)] tracking-tight block leading-none">
              E-Retribusi
            </span>
            <span className="text-[10px] font-medium text-[var(--color-ink-500)] tracking-wider uppercase block mt-1">
              DLH Lumajang
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--color-brand-mid)] bg-[var(--color-brand-wash)] font-semibold'
                      : 'text-[var(--color-ink-700)] hover:text-[var(--color-brand-mid)] hover:bg-[var(--color-ink-100)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-brand-mid)] border border-[var(--color-brand-mid)] hover:bg-[var(--color-brand-wash)] transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login Pengurus
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-[var(--color-ink-700)] hover:bg-[var(--color-ink-100)]"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[var(--color-ink-100)] bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-[var(--color-brand-mid)] bg-[var(--color-brand-wash)] font-semibold'
                    : 'text-[var(--color-ink-700)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--color-brand-mid)] mt-4 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Login Pengurus
          </Link>
        </div>
      )}
    </nav>
  );
}
