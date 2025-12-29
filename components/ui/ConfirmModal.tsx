'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
  cancelText = 'İptal',
  onConfirm,
  showCancel = false
}: ConfirmModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Type-based styling
  const typeStyles = {
    success: {
      bg: 'from-green-600 to-emerald-600',
      icon: 'fa-circle-check',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20'
    },
    error: {
      bg: 'from-red-600 to-rose-600',
      icon: 'fa-circle-xmark',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20'
    },
    warning: {
      bg: 'from-yellow-600 to-orange-600',
      icon: 'fa-triangle-exclamation',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20'
    },
    info: {
      bg: 'from-blue-600 to-purple-600',
      icon: 'fa-circle-info',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    }
  };

  const style = typeStyles[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`bg-slate-800 rounded-3xl w-full max-w-md border ${style.borderColor} shadow-2xl overflow-hidden transform transition-all duration-300 animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${style.bg} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <i className={`fa-solid ${style.icon} text-2xl`}></i>
            </div>
            <h2 className="text-xl font-extrabold flex-1">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-600 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 bg-gradient-to-r ${style.bg} text-white py-3 rounded-xl font-bold shadow-btn hover:opacity-90 transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
