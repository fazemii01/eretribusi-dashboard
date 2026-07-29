'use client';

import { useState } from 'react';
import { Calendar, Clock, Save, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function JadwalOtomatisPage() {
  const [isActive, setIsActive] = useState(true);
  const [cronDay, setCronDay] = useState('1'); // Tanggal 1 setiap bulan
  const [cronTime, setCronTime] = useState('00:00'); // Pukul 00:00 WIB
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isExecutingManual, setIsExecutingManual] = useState(false);
  const [manualResult, setManualResult] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg('Konfigurasi Jadwal Otomatis berhasil disimpan ke database!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleRunManual = () => {
    setIsExecutingManual(true);
    setManualResult('');
    setTimeout(() => {
      setIsExecutingManual(false);
      setManualResult('Berhasil menerbitkan 1.050 tagihan retribusi baru dalam 11 batch antrean (Queue)!');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-ink-100)]">
        <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
          Pengaturan Jadwal Otomatis (Cron Job)
        </h1>
        <p className="text-xs text-[var(--color-ink-500)] mt-1">
          Konfigurasi terbitan otomatis tagihan retribusi bulanan menggunakan sistem Antrean (Queue System 100/batch).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-6">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* Status Switcher */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div>
                <span className="text-sm font-bold text-[var(--color-brand-deep)] block">Status Cron Job</span>
                <span className="text-xs text-emerald-700">
                  {isActive ? 'Aktif — Tagihan diterbitkan otomatis' : 'Non-Aktif — Cron dihentikan'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-[var(--color-brand-mid)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Execution Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--color-brand-mid)]" />
                  Tanggal Eksekusi
                </label>
                <select
                  value={cronDay}
                  onChange={(e) => setCronDay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs font-bold text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d.toString()}>
                      Setiap Tanggal {d} Awal Bulan
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[var(--color-brand-mid)]" />
                  Waktu Eksekusi (WIB)
                </label>
                <input
                  type="time"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs font-bold text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                />
              </div>
            </div>

            {/* Info Queue Notice */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Metode Eksekusi Antrean (Queue System)
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Sistem akan memproses 100 data pelanggan per batch dengan jeda 3 detik untuk menjaga kestabilan database backend.
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Konfigurasi
            </button>
          </form>
        </div>

        {/* Manual Test Execution & Log Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-ink-900)] flex items-center gap-2">
              <Play className="w-4 h-4 text-[var(--color-brand-mid)]" />
              Uji Coba Manual
            </h3>
            <p className="text-xs text-[var(--color-ink-500)] leading-relaxed">
              Jalankan pembuatan tagihan massal sekarang tanpa menunggu jadwal otomatis.
            </p>

            {manualResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {manualResult}
              </div>
            )}

            <button
              onClick={handleRunManual}
              disabled={isExecutingManual}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {isExecutingManual ? (
                <span className="animate-pulse">Memproses Queue...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Jalankan Cron Now
                </>
              )}
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-ink-900)] uppercase tracking-wider">
              Log Eksekusi Terakhir
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Waktu Terakhir:</span>
                <span className="font-bold text-gray-900">01 Juli 2026 00:00:02</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Total Tagihan:</span>
                <span className="font-bold text-emerald-600">1.050 Tagihan</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-600 uppercase">Sukses (11 Batches)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
