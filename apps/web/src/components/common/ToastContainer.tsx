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
        let borderClass = 'border-emerald-500/40 bg-slate-900/95 text-emerald-400';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/40 bg-slate-900/95 text-amber-400';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-red-500/40 bg-slate-900/95 text-red-400';
          iconColor = 'text-red-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-indigo-500/40 bg-slate-900/95 text-indigo-400';
          iconColor = 'text-indigo-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-right-5 fade-in duration-200 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs text-slate-200 leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
