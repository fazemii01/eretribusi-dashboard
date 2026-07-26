'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/admin/StatCard';
import { DollarSign, TrendingDown, Users, Star, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { API_BASE_URL } from '@/lib/api';

export default function DashboardStatistik() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(false);

  const [statsData, setStatsData] = useState({
    totalLunas: 240200000,
    totalTunggakan: 12450000,
    totalPelanggan: 1050,
    kepatuhan: 95,
    chartData: [
      { bulan: 'Jan', lunas: 15000000, tunggakan: 2500000 },
      { bulan: 'Feb', lunas: 16200000, tunggakan: 1800000 },
      { bulan: 'Mar', lunas: 18000000, tunggakan: 1200000 },
      { bulan: 'Apr', lunas: 17500000, tunggakan: 1500000 },
      { bulan: 'Mei', lunas: 19000000, tunggakan: 900000 },
      { bulan: 'Jun', lunas: 21000000, tunggakan: 800000 },
      { bulan: 'Jul', lunas: 20500000, tunggakan: 1100000 },
      { bulan: 'Agu', lunas: 22000000, tunggakan: 600000 },
      { bulan: 'Sep', lunas: 21500000, tunggakan: 750000 },
      { bulan: 'Okt', lunas: 23000000, tunggakan: 500000 },
      { bulan: 'Nov', lunas: 22500000, tunggakan: 600000 },
      { bulan: 'Des', lunas: 24000000, tunggakan: 400000 },
    ],
    recentPayments: [
      { waktu: '14:20:05', nama: 'Budi Santoso', bulan: 'Maret 2026', nominal: 15000, admin: 'Admin DLH' },
      { waktu: '13:45:12', nama: 'Siti Aminah', bulan: 'Maret 2026', nominal: 25000, admin: 'Admin DLH' },
      { waktu: '11:10:44', nama: 'Agus Setiawan', bulan: 'Maret 2026', nominal: 15000, admin: 'Petugas Loket' },
      { waktu: '09:30:18', nama: 'Rina Wijaya', bulan: 'Februari 2026', nominal: 35000, admin: 'Admin DLH' },
      { waktu: '08:15:00', nama: 'Eko Prasetyo', bulan: 'Maret 2026', nominal: 15000, admin: 'Petugas Loket' },
    ],
  });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/tagihan/stats?tahun=${selectedYear}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.chartData) {
            setStatsData(data);
          }
        }
      } catch (err) {
        // Fallback to default mock stats if backend server isn't running locally yet
        console.log('Using default dashboard statistics mock data');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedYear]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
            Dashboard Statistik
          </h1>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Ringkasan real-time keuangan dan kepatuhan retribusi sampah.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[var(--color-ink-100)] shadow-xs">
          <Calendar className="w-4 h-4 text-[var(--color-ink-500)]" />
          <label className="text-xs font-bold text-[var(--color-ink-500)] uppercase tracking-wider">
            Tahun Laporan:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-ink-300)] text-xs font-semibold text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none cursor-pointer"
          >
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pendapatan Lunas"
          value={`Rp ${statsData.totalLunas.toLocaleString('id-ID')}`}
          icon={DollarSign}
          accentColor="border-t-[var(--color-success)]"
        />
        <StatCard
          title="Total Tunggakan"
          value={`Rp ${statsData.totalTunggakan.toLocaleString('id-ID')}`}
          icon={TrendingDown}
          accentColor="border-t-[var(--color-danger)]"
        />
        <StatCard
          title="Pelanggan Aktif"
          value={`${statsData.totalPelanggan.toLocaleString('id-ID')} KK`}
          icon={Users}
          accentColor="border-t-[var(--color-info)]"
        />
        <StatCard
          title="Kepatuhan Bayar"
          value={`${statsData.kepatuhan}%`}
          icon={Star}
          accentColor="border-t-[var(--color-warning)]"
        />
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[var(--color-ink-900)] flex items-center gap-2">
          Grafik Penerimaan & Tunggakan Tahun {selectedYear}
        </h3>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={statsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLunas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand-mid)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-brand-mid)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTunggakan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="bulan" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              />
              <Area type="monotone" dataKey="lunas" name="Lunas" stroke="var(--color-brand-mid)" fillOpacity={1} fill="url(#colorLunas)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="tunggakan" name="Tunggakan" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorTunggakan)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5 Recent Payments */}
      <div className="bg-white p-6 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[var(--color-ink-900)]">5 Pelunasan Terakhir</h3>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-ink-100)]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">Waktu</th>
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">Bulan Tagihan</th>
                <th className="p-4">Nominal</th>
                <th className="p-4 text-right">Penerima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {statsData.recentPayments.map((p, idx) => (
                <tr key={idx} className="hover:bg-[var(--color-ink-50)] transition-colors">
                  <td className="p-4 font-mono text-xs">{p.waktu}</td>
                  <td className="p-4 font-bold text-[var(--color-ink-900)]">{p.nama}</td>
                  <td className="p-4">{p.bulan}</td>
                  <td className="p-4 font-semibold text-[var(--color-brand-deep)]">Rp {p.nominal.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right text-xs text-[var(--color-ink-500)]">{p.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
