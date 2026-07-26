'use client';

import { QRCodeSVG } from 'qrcode.react';

interface ReceiptPrintProps {
  invoiceId: string;
  waktu: string;
  bulan: string;
  idPelanggan: string;
  nama: string;
  alamat: string;
  nominal: number;
  admin: string;
}

export default function ReceiptPrint({
  invoiceId,
  waktu,
  bulan,
  idPelanggan,
  nama,
  alamat,
  nominal,
  admin,
}: ReceiptPrintProps) {
  const publicUrl = `https://dev.dlh.lumajangkab.go.id/tagihan?id=${idPelanggan}`;

  return (
    <div className="bg-white p-8 max-w-md mx-auto border-2 border-dashed border-[var(--color-ink-900)] text-[var(--color-ink-900)] font-sans space-y-6">
      {/* Letterhead */}
      <div className="text-center border-b-2 border-[var(--color-ink-900)] pb-4 space-y-1">
        <h2 className="text-lg font-bold uppercase tracking-wide">Dinas Lingkungan Hidup</h2>
        <p className="text-xs font-semibold uppercase">Kabupaten Lumajang</p>
        <p className="text-[10px] text-[var(--color-ink-500)]">Tanda Bukti Pembayaran Retribusi Sampah</p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-[var(--color-ink-500)]">Waktu Bayar:</span>
          <span className="font-semibold">{waktu}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-[var(--color-ink-500)]">Bulan Tagihan:</span>
          <span className="font-semibold">{bulan}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-[var(--color-ink-500)]">ID Wajib Retribusi:</span>
          <span className="font-mono-id font-bold">{idPelanggan}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-[var(--color-ink-500)]">Nama Pelanggan:</span>
          <span className="font-semibold">{nama}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-[var(--color-ink-500)]">Alamat:</span>
          <span className="font-medium text-right">{alamat}</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="pt-2 border-t-2 border-[var(--color-ink-900)] flex justify-between items-center text-sm font-bold">
        <span>Total Bayar:</span>
        <span className="text-base font-extrabold">Rp {nominal.toLocaleString('id-ID')}</span>
      </div>

      {/* QR Code & Footer Notice per PRD */}
      <div className="pt-4 flex flex-col items-center justify-center space-y-3 text-center border-t border-gray-200">
        <QRCodeSVG value={publicUrl} size={110} level="M" />
        <p className="text-[10px] font-medium text-[var(--color-ink-500)] leading-tight max-w-xs">
          Bukti Resmi Pembayaran Retribusi sampah Dinas Lingkungan Hidup Kabupaten Lumajang.
        </p>
      </div>

      {/* Admin Signature */}
      <div className="pt-4 text-right text-xs space-y-8">
        <div>
          <span>Petugas / Admin Penerima</span>
        </div>
        <div className="font-bold underline uppercase">
          ( {admin || 'Admin DLH'} )
        </div>
      </div>
    </div>
  );
}
