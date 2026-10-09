import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '4xl' | '6xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '4xl',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-[96vw] h-[92vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog: Neo-Brutalist White with 2px solid black border & 12px hard shadow */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white border-2 border-black rounded-2xl shadow-hard-xl overflow-hidden flex flex-col z-10 max-h-[92vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header: #ffe17c with border-b-2 border-black */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#ffe17c] shrink-0">
            <div className="pr-4 overflow-hidden">
              {title && (
                typeof title === 'string' ? (
                  <h2 className="font-heading text-xl font-extrabold text-black truncate">{title}</h2>
                ) : (
                  title
                )
              )}
              {subtitle && <p className="text-xs text-black/80 font-bold mt-0.5 truncate">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
