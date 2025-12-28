'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  confirmVariant = 'primary',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmButtonClass = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    primary: 'bg-blue-600 hover:bg-blue-700'
  }[confirmVariant];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-xl font-black text-white mb-2">{title}</h3>
          <p className="text-slate-300">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 ${confirmButtonClass} text-white font-bold py-3 rounded-xl transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
