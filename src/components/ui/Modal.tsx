import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  preventClose?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  preventClose = false,
  footer,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose, preventClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !preventClose) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl',
    full: 'max-w-full mx-2 sm:mx-4',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleBackdropClick}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white rounded-t-lg sm:rounded-lg shadow-xl transform transition-all max-h-[95vh] sm:max-h-[90vh] overflow-hidden',
            sizeClasses[size]
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0 pr-2">
                {title && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h2>
                )}
                {description && (
                  <p className="mt-1 text-sm sm:text-base text-gray-600 line-clamp-2">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 sm:h-8 sm:w-8 p-0 flex-shrink-0 touch-manipulation"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirm Dialog Component
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  children,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const footer = (
    <>
      <Button 
        variant="outline" 
        onClick={onClose} 
        disabled={loading}
        className="w-full sm:w-auto touch-manipulation"
      >
        {cancelText}
      </Button>
      <Button
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        onClick={handleConfirm}
        loading={loading}
        className="w-full sm:w-auto touch-manipulation"
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      size="sm"
      preventClose={loading}
    >
      {children}
    </Modal>
  );
};