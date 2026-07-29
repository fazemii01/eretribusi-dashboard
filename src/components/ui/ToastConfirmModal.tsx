'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  itemId?: string;
  itemNama?: string;
  confirmText?: string;
  onConfirm: () => void;
}

interface ToastConfirmProps {
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  confirmState: ConfirmState | null;
  onCloseConfirm: () => void;
}

export default function ToastConfirmModal({
  toasts,
  onDismissToast,
  confirmState,
  onCloseConfirm,
}: ToastConfirmProps) {
  return (
    <>
      {/* Toast Stack (Top Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md animate-slideInRight transition-all ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/30'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/40'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              {t.title && <h4 className="font-bold text-sm mb-0.5">{t.title}</h4>}
              <p className="leading-relaxed opacity-95">{t.message}</p>
            </div>

            <button
              onClick={() => onDismissToast(t.id)}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmState && confirmState.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp">
            {/* Header Icon */}
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {confirmState.title || 'Konfirmasi Hapus Data'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p className="leading-relaxed">{confirmState.message}</p>
              {(confirmState.itemId || confirmState.itemNama) && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px] space-y-1">
                  {confirmState.itemNama && (
                    <div className="font-bold text-slate-900 dark:text-white">{confirmState.itemNama}</div>
                  )}
                  {confirmState.itemId && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{confirmState.itemId}</div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCloseConfirm}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm();
                  onCloseConfirm();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {confirmState.confirmText || 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
