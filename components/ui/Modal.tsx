import React, { ReactNode, useEffect, useCallback, useRef } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  const isClosingRef = useRef(false);
  const modalKeyRef = useRef(Date.now());

  // Atualizar key quando modal abre para forçar re-mount
  useEffect(() => {
    if (isOpen) {
      modalKeyRef.current = Date.now();
      isClosingRef.current = false;
    }
  }, [isOpen]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handler para fechar com debounce (prevenir fechamento múltiplo)
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    onClose();
    
    // Reset após 300ms
    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  }, [onClose]);

  // Handler para ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <div 
      key={modalKeyRef.current}
      className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" 
      aria-modal="true" 
      role="dialog"
      onClick={(e) => {
        // Fechar ao clicar no backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-2xl dark:shadow-black/50 w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700`}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          <button 
            onClick={handleClose} 
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            aria-label="Fechar modal"
            type="button"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

