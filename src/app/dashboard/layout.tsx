import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--color-ink-50)] text-[var(--color-ink-900)]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
