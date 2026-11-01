import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface EnlargedChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export const EnlargedChartModal: React.FC<EnlargedChartModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl shadow-glass flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-black/15 dark:border-white/15">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">
                {title}
              </h3>
              {badge && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-white/80 border border-black/10 dark:border-white/10">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-zinc-600 dark:text-white/50 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl glass-inset hover:bg-black/5 dark:hover:bg-white/15 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Cerrar vista ampliada (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-zinc-500 dark:text-white/40">
          <span>Vista interactiva de inspección de alta precisión</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            Cerrar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
