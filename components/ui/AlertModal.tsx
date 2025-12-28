'use client';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({
  isOpen,
  title,
  message,
  variant = 'info',
  onClose
}: AlertModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    success: {
      icon: 'fa-circle-check',
      iconColor: 'text-green-500',
      bgGradient: 'from-green-900/20 to-green-800/10',
      borderColor: 'border-green-700/30'
    },
    error: {
      icon: 'fa-circle-xmark',
      iconColor: 'text-red-500',
      bgGradient: 'from-red-900/20 to-red-800/10',
      borderColor: 'border-red-700/30'
    },
    warning: {
      icon: 'fa-triangle-exclamation',
      iconColor: 'text-yellow-500',
      bgGradient: 'from-yellow-900/20 to-yellow-800/10',
      borderColor: 'border-yellow-700/30'
    },
    info: {
      icon: 'fa-circle-info',
      iconColor: 'text-blue-500',
      bgGradient: 'from-blue-900/20 to-blue-800/10',
      borderColor: 'border-blue-700/30'
    }
  }[variant];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-br ${variantStyles.bgGradient} border ${variantStyles.borderColor} rounded-xl p-4 mb-4`}>
          <div className="flex items-start gap-4">
            <div className={`text-3xl ${variantStyles.iconColor}`}>
              <i className={`fa-solid ${variantStyles.icon}`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-white mb-1">{title}</h3>
              <p className="text-slate-300 text-sm">{message}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
        >
          Tamam
        </button>
      </div>
    </div>
  );
}
