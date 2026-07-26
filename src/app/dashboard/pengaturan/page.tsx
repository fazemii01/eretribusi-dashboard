'use client';

import { useState } from 'react';
import { Save, QrCode, Phone, CreditCard, User, CheckCircle2, Clock, Zap, Calendar } from 'lucide-react';

export default function PengaturanPage() {
  const [noRek, setNoRek] = useState('BANK JATIM - 1061001847');
  const [anRek, setAnRek] = useState('Bendahara Penerimaan DLH');
  const [noWa, setNoWa] = useState('6281234567890');

  // Automated Cron Job Schedule Settings State
  const [cronActive, setCronActive] = useState(true);
  const [cronDate, setCronDate] = useState('1');
  const [cronTime, setCronTime] = useState('00:00');

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Pengaturan & Jadwal Cron Job Otomatis berhasil disimpan!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-ink-100)]">
        <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
          Panduan Pembayaran & System Settings
        </h1>
        <p className="text-xs text-[var(--color-ink-500)] mt-1">
          Atur rekening bank, WhatsApp admin, dan Jadwal Cron Job Otomatis untuk penerbitan tagihan bulanan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: BANK & WA SETTINGS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[var(--color-ink-900)] uppercase tracking-wider border-b pb-3">
            Informasi Pembayaran Warga
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--color-brand-mid)]" />
              Bank & Nomor Rekening
            </label>
            <input
              type="text"
              value={noRek}
              onChange={(e) => setNoRek(e.target.value)}
              placeholder="Misal: BANK JATIM - 1061001847"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none focus:border-[var(--color-brand-mid)] font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--color-brand-mid)]" />
              Atas Nama (a.n) Rekening
            </label>
            <input
              type="text"
              value={anRek}
              onChange={(e) => setAnRek(e.target.value)}
              placeholder="Misal: Bendahara Penerimaan DLH"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none focus:border-[var(--color-brand-mid)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-brand-mid)]" />
              Nomor WhatsApp Admin (Wajib Awalan 62)
            </label>
            <input
              type="text"
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
              placeholder="Misal: 6281234567890"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[var(--color-brand-mid)]" />
              Upload Gambar QRIS Statis (Opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-700)] bg-white cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 2: AUTOMATED CRON JOB SCHEDULER SETTINGS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-[var(--color-ink-900)] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Jadwal Cron Job Otomatis (Auto-Generate Tagihan)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cronActive}
                onChange={(e) => setCronActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-mid)]"></div>
            </label>
          </div>

          {cronActive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-brand-mid)]" />
                  Tanggal Eksekusi Bulanan
                </label>
                <select
                  value={cronDate}
                  onChange={(e) => setCronDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-semibold"
                >
                  <option value="1">Setiap Tanggal 1 awal bulan</option>
                  <option value="5">Setiap Tanggal 5 awal bulan</option>
                  <option value="10">Setiap Tanggal 10 awal bulan</option>
                  <option value="25">Setiap Tanggal 25 akhir bulan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-brand-mid)]" />
                  Waktu / Jam Eksekusi (WIB)
                </label>
                <input
                  type="time"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-ink-300)] text-sm text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-semibold"
                />
              </div>

              <div className="sm:col-span-2 bg-[var(--color-brand-wash)] p-4 rounded-xl border border-[var(--color-brand-light)]/20 text-xs text-[var(--color-brand-deep)] flex items-start gap-3">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Jadwal Terdaftar System Cron:</p>
                  <p className="text-[var(--color-ink-700)]">
                    Sistem backend NestJS akan otomatis mengeksekusi penerbitan massal tagihan retribusi baru pada <span className="font-bold text-[var(--color-brand-deep)]">Tanggal {cronDate} pukul {cronTime} WIB</span> setiap bulannya.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {savedMsg && (
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-success)] bg-[var(--color-success-bg)] p-3.5 rounded-xl border border-[var(--color-success)]/20 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Simpan Seluruh Pengaturan & Cron Schedule
        </button>
      </form>
    </div>
  );
}
