'use client';

import { useState, useEffect } from 'react';
import ReceiptPrint from '@/components/admin/ReceiptPrint';
import { Search, Printer, Download, FileCheck, CheckCircle2, Calendar, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';


interface ReceiptRow {
  idKuitansi: string;
  idInvoice: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  waktuBayar: string;
  bulan: string;
  tahun: string;
  nominal: number;
  admin: string;
  kanal: string;
}

function getMonthNumber(bulanStr: string): number {
  if (!bulanStr) return 0;
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
  return 0;
}

export default function InvoiceReceiptPage() {
  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptRow | null>(null);

  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);

  useEffect(() => {
    async function loadReceipts() {
      try {
        const res = await fetch(`${API_BASE_URL}/pembayaran`, {
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data) ? data : data.data || [];
          setReceipts(
            rawList.map((p: any) => ({
              idKuitansi: p.id_kuitansi,
              idInvoice: p.id_invoice,
              idPelanggan: p.id_pelanggan,
              nama: p.pelanggan?.nama || p.nama || p.id_pelanggan || '-',
              alamat: p.pelanggan?.alamat ? `${p.pelanggan.alamat} (RT ${p.pelanggan.rt || '01'} / RW ${p.pelanggan.rw || '01'})` : '-',
              waktuBayar: p.waktu_bayar ? new Date(p.waktu_bayar).toLocaleString('id-ID') : new Date(p.created_at || Date.now()).toLocaleString('id-ID'),
              bulan: p.bulan,
              tahun: p.bulan ? p.bulan.split(' ').pop() || '2026' : '2026',
              nominal: Number(p.nominal),
              admin: p.admin || 'Petugas DLH',
              kanal: p.referensi_bank ? `Bank SNAP (Ref: ${p.referensi_bank})` : 'Loket Tunai DLH',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load pembayaran API:', err);
      }
    }
    loadReceipts();
  }, []);

  const availableYears = (() => {
    const set = new Set<string>();
    const currentYr = new Date().getFullYear();
    for (let i = currentYr - 2; i <= currentYr + 5; i++) {
      set.add(i.toString());
    }
    receipts.forEach((r) => {
      if (r.tahun && /^\d{4}$/.test(r.tahun)) set.add(r.tahun);
    });
    return Array.from(set).sort().reverse();
  })();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredReceipts = receipts.filter((item) => {
    if (!item) return false;
    const namaStr = (item.nama || '').toLowerCase();
    const idStr = (item.idPelanggan || '').toLowerCase();
    const kuitansiStr = (item.idKuitansi || '').toLowerCase();
    const searchStr = (search || '').toLowerCase();

    const matchSearch =
      search === '' ||
      namaStr.includes(searchStr) ||
      idStr.includes(searchStr) ||
      kuitansiStr.includes(searchStr);
    const matchTahun = filterTahun === '' || (item.tahun || '') === filterTahun;
    const matchBulan = filterBulan === '' || (item.bulan || '').toLowerCase().includes(filterBulan.toLowerCase());
    return matchSearch && matchTahun && matchBulan;
  }).sort((a, b) => {
    const yearA = parseInt(a.tahun || '0', 10);
    const yearB = parseInt(b.tahun || '0', 10);
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return getMonthNumber(a.bulan) - getMonthNumber(b.bulan);
  });

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / itemsPerPage));

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrintReceipt = (row: ReceiptRow) => {
    setPrintReceiptData(row);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportCSV = () => {
    let csv = 'No Kuitansi,ID Wajib Retribusi,Nama,Waktu Bayar,Periode,Nominal,Penerima,Kanal\n';
    filteredReceipts.forEach((r) => {
      csv += `${r.idKuitansi},${r.idPelanggan},${r.nama},${r.waktuBayar},${r.bulan},${r.nominal},${r.admin},${r.kanal}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bukti_Tanda_Terima_Invoice_${filteredReceipts.length}_rows.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
              Bukti Tanda Terima (Invoice & Kuitansi)
            </h1>
            <span className="px-3 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] font-bold text-xs border border-[var(--color-success)]/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {filteredReceipts.length} Kuitansi Lunas
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Arsip resmi bukti tanda terima dan kuitansi pembayaran retribusi sampah yang telah terverifikasi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          Export Rekap CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-6">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Pencarian Global Kuitansi
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari No Kuitansi, ID Pelanggan, atau Nama..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
            </div>
          </div>

          {/* Filter Tahun */}
          <div className="lg:col-span-3">
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

          {/* Filter Bulan */}
          <div className="lg:col-span-3">
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
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">No. Kuitansi</th>
                <th className="p-4">ID Wajib Retribusi</th>
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">Waktu Bayar</th>
                <th className="p-4">Periode</th>
                <th className="p-4">Nominal</th>
                <th className="p-4">Penerima / Kanal</th>
                <th className="p-4 text-center">Cetak Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-[var(--color-ink-500)] bg-[var(--color-ink-50)]/50">
                    Belum ada bukti tanda terima pembayaran.
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((item) => (
                  <tr key={item.idKuitansi} className="hover:bg-[var(--color-ink-50)] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-[var(--color-brand-deep)]">
                      {item.idKuitansi}
                    </td>
                    <td className="p-4">
                      <span className="font-mono-id px-2.5 py-1 rounded-md bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs border border-[var(--color-brand-light)]/20">
                        {item.idPelanggan}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[var(--color-ink-900)]">{item.nama}</td>
                    <td className="p-4 text-xs font-medium text-[var(--color-ink-700)]">{item.waktuBayar}</td>
                    <td className="p-4 font-semibold">{item.bulan}</td>
                    <td className="p-4 font-bold text-[var(--color-brand-deep)]">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-xs font-medium">
                      <div className="font-bold text-[var(--color-ink-900)]">{item.admin}</div>
                      <div className="text-[var(--color-ink-500)]">{item.kanal}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrintReceipt(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-xs font-bold border border-teal-200"
                        title="Cetak Kuitansi Resmi"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--color-ink-100)] bg-[var(--color-ink-50)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-500)]">
          <div>
            Menampilkan <span className="font-bold text-[var(--color-ink-900)]">{filteredReceipts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-[var(--color-ink-900)]">{Math.min(currentPage * itemsPerPage, filteredReceipts.length)}</span> dari <span className="font-bold text-[var(--color-ink-900)]">{filteredReceipts.length.toLocaleString('id-ID')}</span> kuitansi
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

      {/* PRINTABLE SINGLE RECEIPT TEMPLATE */}
      {printReceiptData && (
        <div className="printable-receipt-area hidden">
          <ReceiptPrint
            invoiceId={printReceiptData.idInvoice}
            waktu={printReceiptData.waktuBayar}
            bulan={printReceiptData.bulan}
            idPelanggan={printReceiptData.idPelanggan}
            nama={printReceiptData.nama}
            alamat={printReceiptData.alamat}
            nominal={printReceiptData.nominal}
            admin={printReceiptData.admin}
          />
        </div>
      )}
    </div>
  );
}
