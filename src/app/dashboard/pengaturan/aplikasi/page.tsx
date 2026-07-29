'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, CheckCircle2, Image as ImageIcon, Phone, Globe } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import ToastConfirmModal from '@/components/ui/ToastConfirmModal';
import { useToastConfirm } from '@/hooks/useToastConfirm';

export default function PengaturanAplikasiPage() {
  const { toasts, showToast, dismissToast, confirmState, confirmAction, closeConfirm } = useToastConfirm();

  const [appName, setAppName] = useState('E-Retribusi DLH Lumajang');
  const [waCs, setWaCs] = useState('6281234567890');
  const [berandaTitle, setBerandaTitle] = useState('Sistem E-Retribusi Pelayanan Kebersihan & Sampah');
  const [berandaDesc, setBerandaDesc] = useState('Portal Resmi Dinas Lingkungan Hidup Kabupaten Lumajang untuk kemudahan pembayaran retribusi sampah secara online.');
  
  const [logoPreview, setLogoPreview] = useState('/logo-dlh.png');
  const [faviconPreview, setFaviconPreview] = useState('/logo-dlh.png');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadPengaturan() {
      try {
        const res = await fetch(`${API_BASE_URL}/pengaturan`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.no_wa_admin) setWaCs(data.no_wa_admin);
          }
        }
      } catch (err) {
        console.error('Failed to load pengaturan API:', err);
      }
    }
    loadPengaturan();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        no_wa_admin: waCs,
      };

      const res = await fetch(`${API_BASE_URL}/pengaturan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg('Pengaturan Aplikasi berhasil disimpan ke database!');
        showToast('Pengaturan Aplikasi berhasil disimpan!', 'success');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        showToast('Gagal menyimpan pengaturan aplikasi', 'error');
      }
    } catch (err) {
      console.error('Error saving pengaturan:', err);
      showToast('Gagal terhubung ke server backend', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-ink-100)]">
        <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
          Pengaturan Aplikasi & Branding
        </h1>
        <p className="text-xs text-[var(--color-ink-500)] mt-1">
          Kelola nama sistem, logo resmi, favicon, kontak customer service, dan pesan beranda publik.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding Section */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-[var(--color-ink-900)] uppercase tracking-wider border-b border-gray-100 pb-3">
            1. Identitas Aplikasi & Kontak
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[var(--color-brand-mid)]" />
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[var(--color-brand-mid)]" />
                No WhatsApp CS (Format 62...)
              </label>
              <input
                type="text"
                value={waCs}
                onChange={(e) => setWaCs(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold text-gray-900 bg-gray-50 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Logo & Favicon Section */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-[var(--color-ink-900)] uppercase tracking-wider border-b border-gray-100 pb-3">
            2. Logo & Favicon Resmi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">Logo Aplikasi (Kop & Header)</label>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="w-16 h-16 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                  <img src={logoPreview} alt="Preview Logo" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLogoPreview(URL.createObjectURL(file));
                    }}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ganti Logo
                  </label>
                  <p className="text-[10px] text-gray-400">PNG/JPG (Maks 2MB)</p>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">Favicon Browser</label>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="w-16 h-16 bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                  <img src={faviconPreview} alt="Preview Favicon" className="w-8 h-8 object-contain" />
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="favicon-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFaviconPreview(URL.createObjectURL(file));
                    }}
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ganti Favicon
                  </label>
                  <p className="text-[10px] text-gray-400">ICO/PNG 32x32 (Maks 1MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Landing Content */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-ink-900)] uppercase tracking-wider border-b border-gray-100 pb-3">
            3. Pesan Beranda Publik (Cek Tagihan)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Header Beranda</label>
            <input
              type="text"
              value={berandaTitle}
              onChange={(e) => setBerandaTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={berandaDesc}
              onChange={(e) => setBerandaDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-gray-50 focus:outline-none"
            />
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Save className="w-4 h-4" />
          Simpan Seluruh Pengaturan
        </button>
      </form>
      {/* Toast and Confirmation Modal */}
      <ToastConfirmModal
        toasts={toasts}
        onDismissToast={dismissToast}
        confirmState={confirmState}
        onCloseConfirm={closeConfirm}
      />
    </div>
  );
}
