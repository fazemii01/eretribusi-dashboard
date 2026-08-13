'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ReceiptPrint from '@/components/admin/ReceiptPrint';
import KopSurat from '@/components/admin/KopSurat';
import { Search, Printer, DollarSign, CheckCircle2, XCircle, X, Zap, QrCode, CreditCard, User, Calendar, MapPin, Layers, ChevronLeft, ChevronRight, Camera, Upload, Image as ImageIcon, RotateCcw, Check, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '@/lib/api';
import ToastConfirmModal from '@/components/ui/ToastConfirmModal';
import { useToastConfirm } from '@/hooks/useToastConfirm';
import { convertStaticToDynamicQris, DEFAULT_SHOPEEPAY_STATIC_QRIS } from '@/lib/qris';

interface InvoiceRow {
  idInvoice: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  tahun: string;
  bulan: string;
  nominal: number;
  status: string;
  penerima: string;
  buktiUrl?: string;
}

const getMonthNumber = (bulanStr?: string): number => {
  if (!bulanStr) return 1;
  const b = bulanStr.toLowerCase();
  if (b.includes('jan')) return 1;
  if (b.includes('feb')) return 2;
  if (b.includes('mar')) return 3;
  if (b.includes('apr')) return 4;
  if (b.includes('mei')) return 5;
  if (b.includes('jun')) return 6;
  if (b.includes('jul')) return 7;
  if (b.includes('agu') || b.includes('ags')) return 8;
  if (b.includes('sep')) return 9;
  if (b.includes('okt')) return 10;
  if (b.includes('nov')) return 11;
  if (b.includes('des')) return 12;
  return 1;
};

export default function TagihanAdminPage() {
  const { toasts, showToast, dismissToast, confirmState, confirmAction, closeConfirm } = useToastConfirm();

  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterBatch, setFilterBatch] = useState(''); // '' | 'batch1' | 'batch2'
  const [filterStatus, setFilterStatus] = useState('');

  // Print States: single receipt vs full report
  const [printReceiptData, setPrintReceiptData] = useState<InvoiceRow | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  // Pay Modal States
  const [payModalData, setPayModalData] = useState<InvoiceRow | null>(null);
  const [payMethod, setPayMethod] = useState<'tunai' | 'qris' | 'qris_shopeepay'>('tunai');
  const [shopeePayStaticInput, setShopeePayStaticInput] = useState<string>(DEFAULT_SHOPEEPAY_STATIC_QRIS);
  const [buktiImage, setBuktiImage] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Petugas Loket DLH');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Generate Mass Invoices Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genTahun, setGenTahun] = useState(new Date().getFullYear().toString());
  const [genBulan, setGenBulan] = useState('Juli');
  const [genSuccessMsg, setGenSuccessMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    const currentYr = new Date().getFullYear();
    for (let i = currentYr - 2; i <= currentYr + 5; i++) {
      set.add(i.toString());
    }
    invoices.forEach((inv) => {
      if (inv.tahun && /^\d{4}$/.test(inv.tahun)) set.add(inv.tahun);
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  // Fetch live tagihan data from backend API
  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch(`${API_BASE_URL}/tagihan`);
        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data) ? data : data.data || [];
          setInvoices(
            rawList.map((inv: any) => ({
              idInvoice: inv.id_invoice || `INV-${inv.id}`,
              idPelanggan: inv.id_pelanggan || '-',
              nama: inv.pelanggan?.nama || inv.nama || inv.id_pelanggan || '-',
              alamat: inv.pelanggan?.alamat || inv.alamat || '-',
              rt: inv.pelanggan?.rt || '01',
              rw: inv.pelanggan?.rw || '01',
              tahun: inv.bulan ? inv.bulan.split(' ').pop() || new Date().getFullYear().toString() : new Date().getFullYear().toString(),
              bulan: inv.bulan || 'Maret 2026',
              nominal: Number(inv.nominal) || 0,
              status: inv.status === 'lunas' || inv.status === 'Lunas' ? 'Lunas' : 'Belum Lunas',
              penerima: inv.penerima || '-',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load tagihan API:', err);
      }
    }
    loadInvoices();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    return invoices
      .filter((item) => {
        if (!item) return false;
        const namaStr = (item.nama || '').toLowerCase();
        const idStr = (item.idPelanggan || '').toLowerCase();
        const searchStr = (search || '').toLowerCase();

        const matchSearch = search === '' || namaStr.includes(searchStr) || idStr.includes(searchStr);
        const matchTahun = filterTahun === '' || (item.tahun || '') === filterTahun;
        const matchBulan = filterBulan === '' || (item.bulan || '').toLowerCase().includes(filterBulan.toLowerCase());
        const matchStatus = filterStatus === '' || item.status === filterStatus;

        const monthNum = getMonthNumber(item.bulan);
        const matchBatch =
          filterBatch === '' ||
          (filterBatch === 'batch1' && monthNum >= 1 && monthNum <= 6) ||
          (filterBatch === 'batch2' && monthNum >= 7 && monthNum <= 12);

        return matchSearch && matchTahun && matchBulan && matchStatus && matchBatch;
      })
      .sort((a, b) => {
        const yearA = parseInt(a.tahun || '0', 10);
        const yearB = parseInt(b.tahun || '0', 10);
        if (yearA !== yearB) {
          return yearA - yearB;
        }
        return getMonthNumber(a.bulan) - getMonthNumber(b.bulan);
      });
  }, [invoices, search, filterTahun, filterBulan, filterBatch, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalNominal = filteredInvoices.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalLunas = filteredInvoices
    .filter((inv) => inv.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalBelumLunas = totalNominal - totalLunas;

  const handleTriggerSingleReceiptPrint = (row: InvoiceRow) => {
    setShowPrintReport(false);
    setPrintReceiptData(row);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleTriggerFullReportPrint = () => {
    setPrintReceiptData(null);
    setShowPrintReport(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const loadInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tagihan`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setInvoices(
          rawList.map((inv: any) => ({
            idInvoice: inv.id_invoice || `INV-${inv.id}`,
            idPelanggan: inv.id_pelanggan || '-',
            nama: inv.pelanggan?.nama || inv.nama || inv.id_pelanggan || '-',
            alamat: inv.pelanggan?.alamat || inv.alamat || '-',
            rt: inv.pelanggan?.rt || '01',
            rw: inv.pelanggan?.rw || '01',
            tahun: inv.bulan ? inv.bulan.split(' ').pop() || '2026' : '2026',
            bulan: inv.bulan || 'Maret 2026',
            nominal: Number(inv.nominal) || 0,
            status: inv.status === 'lunas' || inv.status === 'Lunas' ? 'Lunas' : 'Belum Lunas',
            penerima: inv.penerima || '-',
            buktiUrl: inv.bukti_url || '',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load tagihan API:', err);
    }
  };

  // Fetch live tagihan data from backend API
  useEffect(() => {
    loadInvoices();
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.', 'error');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const maxWidth = 1000;
    const origWidth = videoRef.current.videoWidth || 1280;
    const origHeight = videoRef.current.videoHeight || 720;
    const scale = Math.min(1, maxWidth / origWidth);
    canvas.width = origWidth * scale;
    canvas.height = origHeight * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setBuktiImage(dataUrl);
      stopCamera();
      showToast('Foto bukti pembayaran berhasil diambil!', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeBytes = 2 * 1024 * 1024; // 2MB Limit
      if (file.size > maxSizeBytes) {
        showToast('Ukuran file gambar melebihi batas maksimum 2MB. Silakan pilih foto lain yang lebih kecil.', 'error');
        e.target.value = '';
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        img.src = src;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1000;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setBuktiImage(compressedDataUrl);
        } else {
          setBuktiImage(img.src);
        }
        showToast('Gambar bukti pembayaran berhasil diunggah dan dioptimalkan!', 'success');
      };
      img.onerror = () => {
        showToast('Gagal memproses file gambar.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAsPaid = async (idInvoice: string) => {
    if (buktiImage && buktiImage.length > 2.8 * 1024 * 1024) {
      showToast('Ukuran foto bukti pembayaran melebihi batas 2MB. Silakan pilih foto lain yang lebih kecil.', 'error');
      return;
    }
    setIsProcessingPay(true);
    setPaySuccessMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const finalPenerima = payMethod === 'tunai'
        ? `Loket Tunai (${officerName || 'Petugas DLH'})`
        : `QRIS / Transfer (${officerName || 'Petugas DLH'})`;

      const payload = {
        idInvoice,
        status: 'Lunas',
        admin: finalPenerima,
        buktiUrl: buktiImage || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/pembayaran`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPaySuccessMsg(`Pembayaran ${payMethod === 'tunai' ? 'Tunai di Loket' : 'QRIS'} berhasil dikonfirmasi dan status LUNAS!`);
        showToast('Pembayaran berhasil dikonfirmasi!', 'success');
        stopCamera();
        await loadInvoices();
        setTimeout(() => {
          setPayModalData(null);
          setPaySuccessMsg('');
          setBuktiImage('');
        }, 1500);
      } else {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.message || 'Gagal mengonfirmasi pembayaran pada server';
        showToast(`Gagal: ${errMsg}`, 'error');
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      showToast('Gagal terhubung ke server backend', 'error');
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    setGenSuccessMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/tagihan/generate-massal`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bulan: genBulan, tahun: genTahun }),
      });

      if (res.ok) {
        const result = await res.json();
        const msg = result.message || result.pesan || `Berhasil menerbitkan tagihan retribusi untuk periode ${genBulan}!`;
        setGenSuccessMsg(msg);
        showToast(msg, 'success');
        await loadInvoices();
      } else {
        showToast('Gagal menerbitkan tagihan massal', 'error');
      }
    } catch (err) {
      console.error('Error generating mass invoices:', err);
      showToast('Gagal terhubung ke server backend', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
            Riwayat & Loket Tagihan
          </h1>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kelola transaksi pembayaran retribusi, terbitkan tagihan bulanan, dan cetak kuitansi resmi.
          </p>
        </div>

        {/* Generate Mass Invoices Action Button */}
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-xs font-bold transition-all shadow-xs"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          Terbitkan Tagihan Bulanan
        </button>
      </div>

      {/* Filters Bar per PRD */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Pencarian Global
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID Pelanggan atau Nama..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
            </div>
          </div>

          {/* Filter Batch 6 Bulan (Semester) */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[var(--color-brand-mid)]" /> Periode Batch (6 Bulan)
            </label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-brand-mid)] text-xs bg-emerald-50 text-[var(--color-brand-deep)] font-bold focus:outline-none cursor-pointer"
            >
              <option value="">Semua Periode (12 Bulan)</option>
              <option value="batch1">Batch 1 (Semester I: Jan - Jun)</option>
              <option value="batch2">Batch 2 (Semester II: Jul - Des)</option>
            </select>
          </div>

          {/* Filter Tahun */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Tahun
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan Specific */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Bulan
            </label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua Bulan</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>
          </div>

          {/* Filter Status Tagihan */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Status Tagihan
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

          {/* Print PDF Report Action */}
          <div className="lg:col-span-2">
            <button
              onClick={handleTriggerFullReportPrint}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Laporan PDF
            </button>
          </div>
        </div>
      </div>

      {/* Data Table per PRD */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">ID Pelanggan</th>
                <th className="p-4">Nama</th>
                <th className="p-4">RT</th>
                <th className="p-4">RW</th>
                <th className="p-4">Tahun</th>
                <th className="p-4">Bulan</th>
                <th className="p-4">Nominal</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-xs text-[var(--color-ink-500)] bg-[var(--color-ink-50)]/50">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-bold text-[var(--color-ink-900)] text-sm">Belum Ada Data Tagihan</p>
                      <p className="text-[11px] text-[var(--color-ink-500)]">
                        Database tagihan saat ini masih kosong. Anda dapat mengklik tombol <span className="font-bold text-[var(--color-brand-deep)]">&quot;Terbitkan Tagihan Bulanan&quot;</span> di atas untuk memproses iuran retribusi seluruh Wajib Retribusi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((item) => {
                  const isLunas = item.status === 'Lunas';
                  return (
                    <tr key={item.idInvoice} className="hover:bg-[var(--color-ink-50)] transition-colors">
                      <td className="p-4">
                        <span className="font-mono-id px-2.5 py-1 rounded-md bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs border border-[var(--color-brand-light)]/20">
                          {item.idPelanggan}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[var(--color-ink-900)]">{item.nama}</td>
                      <td className="p-4 text-xs font-semibold">{item.rt}</td>
                      <td className="p-4 text-xs font-semibold">{item.rw}</td>
                      <td className="p-4">{item.tahun}</td>
                      <td className="p-4">{item.bulan}</td>
                      <td className="p-4 font-semibold">Rp {item.nominal.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isLunas
                                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/20'
                                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/20'
                            }`}
                          >
                            {isLunas ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {item.status}
                          </span>
                          {isLunas && item.penerima && item.penerima !== '-' && (
                            <span className="text-[10px] font-medium text-[var(--color-ink-500)] mt-0.5 flex items-center gap-1">
                              {item.penerima}
                              {item.buktiUrl && (
                                <button
                                  type="button"
                                  onClick={() => setViewProofUrl(item.buktiUrl || null)}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold underline flex items-center gap-0.5 ml-1"
                                  title="Lihat Bukti Foto Bayar"
                                >
                                  <Camera className="w-3 h-3" /> Foto
                                </button>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isLunas && (
                            <button
                              onClick={() => setPayModalData(item)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                              title="Proses Bayar Tunai / Dynamic QRIS"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Bayar Loket</span>
                            </button>
                          )}
                          {isLunas && (
                            <button
                              onClick={() => handleTriggerSingleReceiptPrint(item)}
                              className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                              title="Cetak Kuitansi Resmi"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--color-ink-100)] bg-[var(--color-ink-50)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-500)]">
          <div>
            Menampilkan <span className="font-bold text-[var(--color-ink-900)]">{filteredInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-[var(--color-ink-900)]">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> dari <span className="font-bold text-[var(--color-ink-900)]">{filteredInvoices.length.toLocaleString('id-ID')}</span> tagihan
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--color-ink-300)] bg-white disabled:opacity-40 hover:bg-[var(--color-ink-50)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[var(--color-ink-900)] px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-[var(--color-ink-300)] bg-white disabled:opacity-40 hover:bg-[var(--color-ink-50)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PROSES BAYAR & MODAL LOKET TUNAI / QRIS */}
      {payModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[var(--color-ink-100)] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-ink-100)]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--color-brand-mid)]" />
                <h3 className="text-base font-bold text-[var(--color-ink-900)]">Loket Pembayaran Retribusi</h3>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setPayModalData(null);
                  setPaySuccessMsg('');
                  setBuktiImage('');
                }}
                className="p-1 rounded-lg text-[var(--color-ink-500)] hover:bg-[var(--color-ink-100)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setPayMethod('tunai');
                  stopCamera();
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  payMethod === 'tunai'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Loket (Tunai)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPayMethod('qris');
                  stopCamera();
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  payMethod === 'qris'
                    ? 'bg-[var(--color-brand-mid)] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QRIS (ASPI)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPayMethod('qris_shopeepay');
                  stopCamera();
                }}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  payMethod === 'qris_shopeepay'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                ShopeePay (Test)
              </button>
            </div>

            {/* Customer & Billing Summary */}
            <div className="bg-[var(--color-ink-50)] p-4 rounded-2xl border border-[var(--color-ink-100)] space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-[var(--color-ink-200)]">
                <span className="text-[var(--color-ink-500)] font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--color-brand-mid)]" /> Wajib Retribusi:
                </span>
                <span className="font-bold text-[var(--color-ink-900)]">{payModalData.nama}</span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-[var(--color-ink-200)]">
                <span className="text-[var(--color-ink-500)] font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--color-brand-mid)]" /> ID Pelanggan:
                </span>
                <span className="font-mono-id font-bold text-[var(--color-brand-deep)]">{payModalData.idPelanggan}</span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-[var(--color-ink-200)]">
                <span className="text-[var(--color-ink-500)] font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-brand-mid)]" /> Periode Tagihan:
                </span>
                <span className="font-bold text-[var(--color-ink-900)]">{payModalData.bulan}</span>
              </div>

              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-[var(--color-ink-900)] font-bold">Total Nominal:</span>
                <span className="text-lg font-extrabold text-[var(--color-brand-deep)]">
                  Rp {payModalData.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* TUNAI MODE */}
            {payMethod === 'tunai' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Nama Petugas Loket / Penerima
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="Contoh: Petugas Loket DLH"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Upload & Camera Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Unggah Bukti Bayar / Tangkap Foto Kamera Loket (Maksimum 2MB)
                  </label>

                  {/* Buttons for Camera vs File Upload */}
                  <div className="flex gap-2">
                    <label className="flex-1 py-2 px-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Upload File Gambar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>

                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>Buka Kamera Loket</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100"
                      >
                        Tutup Kamera
                      </button>
                    )}
                  </div>

                  {/* Live WebCam Stream View */}
                  {isCameraActive && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 bg-black space-y-2 p-2">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover rounded-xl" />
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-emerald-700"
                        >
                          <Camera className="w-4 h-4" />
                          Ambil Foto Bukti (Snapshot)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Image Preview Thumbnail */}
                  {buktiImage && (
                    <div className="relative p-2 border border-emerald-300 bg-emerald-50/50 rounded-2xl flex items-center gap-3">
                      <img src={buktiImage} alt="Bukti Pembayaran" className="w-16 h-16 object-cover rounded-xl border border-emerald-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-900 truncate">Foto Bukti Terlampir</p>
                        <p className="text-[10px] text-emerald-700">Tersimpan dalam format digital</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBuktiImage('')}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-100"
                        title="Hapus Bukti"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QRIS MODE (ASPI) */}
            {payMethod === 'qris' && (
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-2 border-dashed border-[var(--color-brand-mid)]/30 space-y-3 text-center">
                <div className="px-3 py-1 rounded-full bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Dynamic QRIS (ASPI)
                </div>

                <QRCodeSVG
                  value={`00020101021226670016ID.GOV.DLH.LUMAJANG011893600914000000000002155204939953033605405150005802ID5912DLH LUMAJANG6008LUMAJANG61056731162190715${payModalData.idInvoice}6304ABCD`}
                  size={160}
                  level="H"
                />

                <p className="text-[11px] text-[var(--color-ink-500)] leading-tight max-w-xs">
                  Scan QRIS di atas menggunakan <span className="font-bold text-[var(--color-ink-900)]">Bank Jatim M-Banking, GoPay, OVO, ShopeePay, Dana, atau BCA</span>.
                </p>
              </div>
            )}

            {/* QRIS MODE (ShopeePay Minta Uang Test) */}
            {payMethod === 'qris_shopeepay' && (
              <div className="flex flex-col items-center justify-center p-4 bg-orange-50/60 rounded-2xl border-2 border-dashed border-orange-300 space-y-3 text-center">
                <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Go-QRIS Test Mode (ShopeePay)
                </div>

                <div className="w-full text-left space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-orange-900">
                    Payload QRIS Statis ShopeePay
                  </label>
                  <input
                    type="text"
                    value={shopeePayStaticInput}
                    onChange={(e) => setShopeePayStaticInput(e.target.value)}
                    placeholder="Tempel payload 000201... ShopeePay di sini"
                    className="w-full text-[10px] font-mono p-2 bg-white border border-orange-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-xs"
                  />
                  <p className="text-[9px] text-orange-700">
                    Sistem otomatis mengkonversi static ke dynamic nominal <strong>Rp {payModalData.nominal.toLocaleString('id-ID')}</strong>.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-xs border border-orange-200 inline-block">
                  <QRCodeSVG
                    value={convertStaticToDynamicQris(shopeePayStaticInput, payModalData.nominal)}
                    size={160}
                    level="H"
                  />
                </div>

                <p className="text-[11px] text-orange-900 leading-tight max-w-xs">
                  Scan QRIS hasil injeksi Go-QRIS ini dengan aplikasi <span className="font-bold">Shopee, GoPay, OVO, Dana, atau Mobile Banking</span>.
                </p>
              </div>
            )}

            {paySuccessMsg && (
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-success)] bg-[var(--color-success-bg)] p-3.5 rounded-xl border border-[var(--color-success)]/20 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setPayModalData(null);
                  setPaySuccessMsg('');
                  setBuktiImage('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-ink-50)]"
              >
                Batal
              </button>
              {payModalData.status !== 'Lunas' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(payModalData.idInvoice)}
                  disabled={isProcessingPay}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors ${
                    payMethod === 'tunai' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)]'
                  }`}
                >
                  {isProcessingPay ? (
                    <span className="animate-pulse">Memproses...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {payMethod === 'tunai' ? 'Konfirmasi Bayar Tunai' : 'Tandai Lunas via QRIS'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GENERATE MASS INVOICES MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-[var(--color-ink-100)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-ink-100)]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-[var(--color-ink-900)]">Terbitkan Tagihan Bulanan</h3>
              </div>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenSuccessMsg('');
                }}
                className="p-1 rounded-lg text-[var(--color-ink-500)] hover:bg-[var(--color-ink-100)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
                  Tahun Tagihan
                </label>
                <select
                  value={genTahun}
                  onChange={(e) => setGenTahun(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-bold"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
                  Periode Bulan
                </label>
                <select
                  value={genBulan}
                  onChange={(e) => setGenBulan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-bold"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                    <option key={m} value={m}>
                      {m} {genTahun}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-[var(--color-ink-500)] leading-relaxed">
                Sistem akan membuat lembar tagihan retribusi baru secara massal untuk seluruh Wajib Retribusi aktif berdasarkan master tarif masing-masing.
              </p>

              {genSuccessMsg && (
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-success)] bg-[var(--color-success-bg)] p-3 rounded-xl border border-[var(--color-success)]/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{genSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-ink-50)]"
              >
                Tutup
              </button>
              <button
                onClick={handleGenerateInvoices}
                disabled={isGenerating}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] hover:bg-[var(--color-brand-deep)] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    Terbitkan Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Image Preview Modal */}
      {viewProofUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-lg w-full space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Bukti Foto Pembayaran
              </h3>
              <button onClick={() => setViewProofUrl(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center p-2 bg-slate-900 rounded-2xl">
              <img src={viewProofUrl} alt="Bukti Bayar" className="max-h-[60vh] object-contain rounded-xl" />
            </div>
            <button onClick={() => setViewProofUrl(null)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* PRINTABLE SINGLE RECEIPT TEMPLATE */}
      {printReceiptData && (
        <div className="printable-receipt-area hidden">
          <ReceiptPrint
            invoiceId={printReceiptData.idInvoice}
            waktu="14:20:05 26/07/2026"
            bulan={printReceiptData.bulan}
            idPelanggan={printReceiptData.idPelanggan}
            nama={printReceiptData.nama}
            alamat={printReceiptData.alamat}
            nominal={printReceiptData.nominal}
            admin={printReceiptData.penerima}
          />
        </div>
      )}

      {/* PRINTABLE FULL REPORT DOCUMENT WITH BATCH 6 MONTH SORTING */}
      {showPrintReport && (
        <div className="printable-receipt-area hidden">
          <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-slate-800 space-y-6">
            {/* Kop Surat Pemkab Lumajang */}
            <KopSurat subTitle="DINAS LINGKUNGAN HIDUP" />

            <div className="text-center pt-2 border-t border-slate-300 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {filterBatch === 'batch1'
                  ? 'LAPORAN REKAPITULASI SEMESTER I (BATCH 1: BULAN 1 - 6)'
                  : filterBatch === 'batch2'
                  ? 'LAPORAN REKAPITULASI SEMESTER II (BATCH 2: BULAN 7 - 12)'
                  : 'LAPORAN REKAPITULASI TAGIHAN RETRIBUSI SAMPAH (12 BULAN)'}
              </h3>
              <p className="text-xs text-slate-500">
                Tahun {filterTahun || '2026'} | Filter Status: {filterStatus || 'Semua Status'}
              </p>
            </div>

            {/* Ringkasan Realisasi Pendapatan */}
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold bg-slate-100 p-4 rounded-xl border border-slate-300 text-center">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Total Tagihan ({filteredInvoices.length} Inv)</span>
                <span className="text-sm font-bold text-slate-900">Rp {totalNominal.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Realisasi Lunas</span>
                <span className="text-sm font-bold text-emerald-700">Rp {totalLunas.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Piutang Belum Lunas</span>
                <span className="text-sm font-bold text-red-600">Rp {totalBelumLunas.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Tabel Data Invoices (Urut Bulan 1 -> 6 / 7 -> 12) */}
            <div className="w-full">
              <table className="w-full table-fixed text-[9px] text-left border-collapse border-2 border-slate-600">
                <thead className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-600">
                  <tr>
                    <th className="p-1 border border-slate-400 text-center w-[28px]">No</th>
                    <th className="p-1 border border-slate-400 w-[70px] truncate">Bulan</th>
                    <th className="p-1 border border-slate-400 w-[115px] truncate">No. Invoice</th>
                    <th className="p-1 border border-slate-400 w-[80px] truncate">ID Wajib Retribusi</th>
                    <th className="p-1 border border-slate-400 w-[95px] truncate">Nama Pelanggan</th>
                    <th className="p-1 border border-slate-400 text-center w-[42px]">RT / RW</th>
                    <th className="p-1 border border-slate-400 text-right w-[60px] truncate">Nominal</th>
                    <th className="p-1 border border-slate-400 text-center w-[65px] truncate">Status</th>
                    <th className="p-1 border border-slate-400 w-[85px] truncate">Penerima</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => (
                    <tr key={inv.idInvoice} className="border-b border-slate-300">
                      <td className="p-1 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-1 border border-slate-300 font-bold truncate">{inv.bulan}</td>
                      <td className="p-1 border border-slate-300 font-mono font-bold text-[8px] truncate">{inv.idInvoice}</td>
                      <td className="p-1 border border-slate-300 font-mono font-bold text-[8px] truncate">{inv.idPelanggan}</td>
                      <td className="p-1 border border-slate-300 font-bold truncate">{inv.nama}</td>
                      <td className="p-1 border border-slate-300 text-center font-semibold whitespace-nowrap">{inv.rt} / {inv.rw}</td>
                      <td className="p-1 border border-slate-300 text-right font-semibold truncate">Rp {inv.nominal.toLocaleString('id-ID')}</td>
                      <td className="p-1 border border-slate-300 text-center font-bold truncate">{inv.status.toUpperCase()}</td>
                      <td className="p-1 border border-slate-300 font-medium truncate">{inv.penerima}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan */}
            <div className="pt-8 flex justify-between text-xs">
              <div className="text-center space-y-12">
                <p>Bendahara Penerimaan</p>
                <p className="font-bold underline uppercase">( Bendahara DLH )</p>
              </div>
              <div className="text-center space-y-12">
                <p>Lumajang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold underline uppercase">Kepala Dinas Lingkungan Hidup</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
