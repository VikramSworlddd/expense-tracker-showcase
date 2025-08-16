import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />
      
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn btn-danger flex-1"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary flex-1"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

