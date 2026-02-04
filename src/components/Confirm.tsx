'use client';

import { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      confirmBg: 'bg-red-600 hover:bg-red-700',
      headBg: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    warning: {
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      headBg: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    info: {
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      headBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  const config = variantConfig[variant];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 ${config.borderColor}`}>
          {/* Header */}
          <div className={`${config.headBg} px-6 py-4 border-b border-slate-200`}>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-slate-700 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 ${config.confirmBg} text-white rounded-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading && <span className="inline-block animate-spin"></span>}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
