'use client';

import { useState } from 'react';
import ReceiptPrint from '@/components/admin/ReceiptPrint';
import { Search, Printer, Download, FileCheck, CheckCircle2, Calendar, User, CreditCard } from 'lucide-react';

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

export default function InvoiceReceiptPage() {
  const [search, setSearch] = useState('');
  const [filterTahun, setFilterTahun] = useState('2026');
  const [filterBulan, setFilterBulan] = useState('');
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptRow | null>(null);

  const mockReceipts: ReceiptRow[] = [
    {
      idKuitansi: 'PAY-INV-2602-JGY0101001',
      idInvoice: 'INV-2602-JGY0101001',
      idPelanggan: 'JGY0101001',
      nama: 'Budi Santoso',
      alamat: 'Jl. Mawar No 10 (RT 01 / RW 01)',
      waktuBayar: '14:20:05 15/02/2026',
      bulan: 'Februari 2026',
      tahun: '2026',
      nominal: 15000,
      admin: 'Budi Santoso, S.E.',
      kanal: 'Loket Tunai DLH',
    },
    {
      idKuitansi: 'PAY-INV-2603-JGT0203002',
      idInvoice: 'INV-2603-JGT0203002',
      idPelanggan: 'JGT0203002',
      nama: 'Siti Aminah',
      alamat: 'Jl. Melati No 4 (RT 03 / RW 02)',
      waktuBayar: '09:12:40 02/03/2026',
      bulan: 'Maret 2026',
      tahun: '2026',
      nominal: 25000,
      admin: 'Bank SNAP Gateway',
      kanal: 'Bank Jatim QRIS',
    },
    {
      idKuitansi: 'PAY-INV-2603-CTR0401004',
      idInvoice: 'INV-2603-CTR0401004',
      idPelanggan: 'CTR0401004',
      nama: 'Rina Wijaya',
      alamat: 'Jl. Anggrek No 8 (RT 01 / RW 04)',
      waktuBayar: '11:45:12 10/03/2026',
      bulan: 'Maret 2026',
      tahun: '2026',
      nominal: 35000,
      admin: 'Bank SNAP Gateway',
      kanal: 'Gopay QRIS',
    },
    {
      idKuitansi: 'PAY-INV-2601-JGY0101001',
      idInvoice: 'INV-2601-JGY0101001',
      idPelanggan: 'JGY0101001',
      nama: 'Budi Santoso',
      alamat: 'Jl. Mawar No 10 (RT 01 / RW 01)',
      waktuBayar: '10:05:30 18/01/2026',
      bulan: 'Januari 2026',
      tahun: '2026',
      nominal: 15000,
      admin: 'Ahmad Fauzi',
      kanal: 'Loket Tunai DLH',
    },
  ];

  const filteredReceipts = mockReceipts.filter((item) => {
    const matchSearch =
      search === '' ||
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.idPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      item.idKuitansi.toLowerCase().includes(search.toLowerCase());
    const matchTahun = filterTahun === '' || item.tahun === filterTahun;
    const matchBulan = filterBulan === '' || item.bulan.toLowerCase().includes(filterBulan.toLowerCase());
    return matchSearch && matchTahun && matchBulan;
  });

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
              <option value="2026">2026</option>
              <option value="2025">2025</option>
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
          <table className="w-full text-sm text-left border-collapse">
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
              {filteredReceipts.map((item) => (
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
                  <td className="p-4 font-bold text-[var(--color-success)]">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-xs">
                    <span className="font-medium block text-[var(--color-ink-900)]">{item.admin}</span>
                    <span className="text-[10px] text-[var(--color-ink-500)]">{item.kanal}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handlePrintReceipt(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs transition-colors shadow-xs"
                      title="Cetak Kuitansi Resmi"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
