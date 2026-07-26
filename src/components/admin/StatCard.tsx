import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentColor?: string; // e.g. 'border-t-[var(--color-brand-mid)]'
}

export default function StatCard({ title, value, icon: Icon, accentColor = 'border-t-[var(--color-brand-mid)]' }: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-[var(--color-ink-100)] border-t-4 ${accentColor} shadow-xs flex items-center justify-between`}>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider block">
          {title}
        </span>
        <h2 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
          {value}
        </h2>
      </div>

      <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
