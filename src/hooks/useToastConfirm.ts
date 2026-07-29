'use client';

import { useState, useCallback } from 'react';
import { ToastMessage, ConfirmState } from '@/components/ui/ToastConfirmModal';

export function useToastConfirm() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmAction = useCallback(
    (opts: {
      title?: string;
      message: string;
      itemId?: string;
      itemNama?: string;
      confirmText?: string;
      onConfirm: () => void;
    }) => {
      setConfirmState({
        isOpen: true,
        title: opts.title || 'Konfirmasi Hapus Data',
        message: opts.message,
        itemId: opts.itemId,
        itemNama: opts.itemNama,
        confirmText: opts.confirmText,
        onConfirm: opts.onConfirm,
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
    confirmState,
    confirmAction,
    closeConfirm,
  };
}
