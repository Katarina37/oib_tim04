import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Potvrdi',
  cancelText = 'Otkaži',
  isLoading = false,
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return 'var(--color-error)';
      case 'warning':
        return 'var(--color-warning)';
      default:
        return 'var(--color-info)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal__body">
          <div className="flex items-center gap-md">
            <div 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-full)',
                background: `${getVariantColor()}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getVariantColor(),
                flexShrink: 0
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button 
            className={`btn ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Učitavanje...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;