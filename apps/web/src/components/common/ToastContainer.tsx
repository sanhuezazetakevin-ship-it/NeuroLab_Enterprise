import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDemo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
        let iconColor = 'text-emerald-600 dark:text-emerald-400';

        if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30 text-amber-600 dark:text-amber-400';
          iconColor = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-rose-500/30 text-rose-600 dark:text-rose-400';
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-zinc-500/30 text-zinc-700 dark:text-zinc-300';
          iconColor = 'text-zinc-700 dark:text-zinc-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl glass-panel shadow-glass border animate-in slide-in-from-right-5 fade-in duration-200 ${borderClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs text-zinc-900 dark:text-white leading-snug font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
