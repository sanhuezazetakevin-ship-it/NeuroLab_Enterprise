import React from 'react';
import { AlertTriangle, FolderGit2, Loader2, RefreshCw } from 'lucide-react';

export const ProjectRequired: React.FC<{ action?: string }> = ({ action }) => (
  <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[260px]">
    <div className="w-12 h-12 rounded-2xl glass-inset flex items-center justify-center text-zinc-600 dark:text-white/70">
      <FolderGit2 className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">No hay proyecto activo</h3>
      <p className="text-xs text-zinc-500 dark:text-white/50 mt-1 max-w-md">
        {action || 'Seleccione o cree un proyecto en el módulo Proyectos para continuar.'}
      </p>
    </div>
  </div>
);

export const LoadingBlock: React.FC<{ label?: string }> = ({ label = 'Cargando datos…' }) => (
  <div className="glass-card rounded-2xl p-8 flex items-center justify-center gap-3 text-xs text-zinc-600 dark:text-white/60 min-h-[180px]">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>{label}</span>
  </div>
);

export const ErrorBlock: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-rose-500/25">
    <div className="flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-300">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-secondary text-xs font-medium shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    )}
  </div>
);

export const EmptyBlock: React.FC<{ title: string; description?: string; icon?: React.ElementType }> = ({
  title,
  description,
  icon: Icon,
}) => (
  <div className="glass-inset rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2">
    {Icon && <Icon className="w-5 h-5 text-zinc-500 dark:text-white/50" />}
    <p className="text-xs font-semibold text-zinc-800 dark:text-white/80">{title}</p>
    {description && <p className="text-[11px] text-zinc-500 dark:text-white/45 max-w-md">{description}</p>}
  </div>
);
