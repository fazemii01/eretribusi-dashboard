'use client';

import { X, QrCode, Download, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QrisModalProps {
  invoiceId: string;
  nominal: number;
  qrisPayload: string;
  onClose: () => void;
}

export default function QrisModal({ invoiceId, nominal, qrisPayload, onClose }: QrisModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[var(--color-ink-100)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--color-ink-500)] hover:text-[var(--color-danger)] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brand-wash)] text-[var(--color-brand-mid)] mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-ink-900)]">Pembayaran QRIS Dinamis</h3>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">Invoice: {invoiceId}</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-[var(--color-ink-50)] p-6 rounded-xl border border-[var(--color-ink-100)] flex flex-col items-center justify-center mb-5 shadow-inner">
          <QRCodeSVG value={qrisPayload || invoiceId} size={200} level="M" />
          <div className="mt-4 text-center">
            <span className="text-xs text-[var(--color-ink-500)] uppercase tracking-wider block">Total Tagihan</span>
            <span className="text-xl font-extrabold text-[var(--color-brand-deep)]">
              Rp {nominal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-success)] bg-[var(--color-success-bg)] p-2.5 rounded-lg border border-[var(--color-success)]/20 mb-4">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Scan dengan Mobile Banking / GoPay / OVO / ShopeePay</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[var(--color-brand-mid)] text-white text-sm font-semibold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
        >
          Tutup Modal
        </button>
      </div>
    </div>
  );
}
