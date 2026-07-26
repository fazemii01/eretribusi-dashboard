import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-[var(--color-ink-100)] bg-white mt-auto text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-500)]">
        <p className="m-0 font-medium">
          &copy; {new Date().getFullYear()} E-Retribusi Sampah v2.0 |{' '}
          <span className="font-semibold text-[var(--color-ink-700)]">
            Dinas Lingkungan Hidup Kabupaten Lumajang
          </span>
        </p>

        <div className="flex items-center gap-6">
          <Link href="/tagihan" className="hover:text-[var(--color-brand-mid)] transition-colors">
            Cek Tagihan
          </Link>
          <Link href="/login" className="hover:text-[var(--color-brand-mid)] transition-colors">
            Portal Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
