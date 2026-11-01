import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Download,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  FileCheck2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { ApiClient } from '../../lib/api';
import {
  LoadingBlock,
  ErrorBlock,
  EmptyBlock,
  ProjectRequired,
} from '../../components/common/ProjectGuard';
import { formatDateTime, formatMetric, formatPercent, shortId } from '../../lib/format';
import { ModelLifecycleStatus, ModelMetrics, ModelVersion, UserRole } from '../../types';

const APPROVAL_ROLES: string[] = ['ADMIN', 'PROJECT_LEAD'];

// Transiciones aceptadas por el backend (app/api/v1/models.py).
const TRANSITIONS: Record<ModelLifecycleStatus, ModelLifecycleStatus[]> = {
  DRAFT: ['REVIEWED', 'RETIRED'],
  REVIEWED: ['APPROVED', 'RETIRED'],
  APPROVED: ['RETIRED'],
  RETIRED: [],
};

const STATUS_STYLES: Record<ModelLifecycleStatus, string> = {
  DRAFT: 'text-zinc-700 dark:text-white/80 border-black/20 dark:border-white/25',
  REVIEWED: 'text-sky-700 dark:text-sky-300 border-sky-500/30',
  APPROVED: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  RETIRED: 'text-zinc-500 dark:text-white/40 border-black/10 dark:border-white/10',
};

function lifecycleActions(
  status: ModelLifecycleStatus,
  effectiveRole: UserRole | string,
): { target: ModelLifecycleStatus; label: string; requiresApproval: boolean; allowed: boolean }[] {
  return TRANSITIONS[status].map((target) => {
    const requiresApproval = target === 'APPROVED' || target === 'RETIRED';
    const allowed = !requiresApproval || APPROVAL_ROLES.includes(String(effectiveRole));
    return { target, label: target, requiresApproval, allowed };
  });
}

function metricHighlights(metrics: ModelMetrics | null): { label: string; value: string }[] {
  if (!metrics) return [];
  const accuracy = metrics.testAccuracy ?? metrics.accuracy;
  const loss = metrics.testLoss ?? metrics.loss;
  const highlights: { label: string; value: string }[] = [];
  if (accuracy != null) highlights.push({ label: 'Exactitud', value: formatPercent(accuracy) });
  if (loss != null) highlights.push({ label: 'Pérdida', value: formatMetric(loss) });
  if (metrics.f1Score != null) highlights.push({ label: 'F1-Score', value: formatMetric(metrics.f1Score) });
  if (metrics.r2Score != null) highlights.push({ label: 'R²', value: formatMetric(metrics.r2Score) });
  if (metrics.testRmse != null) highlights.push({ label: 'RMSE', value: formatMetric(metrics.testRmse) });
  return highlights.slice(0, 4);
}

export const ModelRegistryView: React.FC = () => {
  const { activeProject, showToast, currentRole } = useApp();

  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ModelLifecycleStatus>('ALL');

  const effectiveRole = (activeProject?.effectiveRole as UserRole | string) || currentRole;

  const loadModels = useCallback(
    async (silent = false) => {
      if (!activeProject) return;
      if (!silent) setLoading(true);
      try {
        const list = await ApiClient.listModels(activeProject.id);
        setModels(list);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No fue posible cargar el registro de modelos');
      } finally {
        setLoading(false);
      }
    },
    [activeProject],
  );

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadModels(true);
    setRefreshing(false);
  };

  const handleStatusChange = async (model: ModelVersion, target: ModelLifecycleStatus) => {
    const transition = lifecycleActions(model.status, effectiveRole).find((item) => item.target === target);
    if (!transition) {
      showToast(`Transición no permitida: ${model.status} → ${target}`, 'warning');
      return;
    }
    if (!transition.allowed) {
      showToast(
        `Permiso denegado: se requiere rol ADMIN o PROJECT_LEAD para pasar a ${target} (RBAC)`,
        'warning',
      );
      return;
    }
    setUpdatingId(model.id);
    try {
      const updated = await ApiClient.updateModelStatus(model.id, target);
      setModels((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      showToast(`Versión ${model.version}: ${model.status} → ${target}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No fue posible actualizar el estado', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyChecksum = async (checksum: string, id: string) => {
    try {
      await navigator.clipboard.writeText(checksum);
      setCopiedId(id);
      showToast('Hash SHA-256 copiado al portapapeles', 'info');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast('No fue posible acceder al portapapeles del navegador', 'error');
    }
  };

  const handleDownload = async (model: ModelVersion) => {
    setDownloadingId(model.id);
    try {
      const { blob, filename } = await ApiClient.downloadModel(model.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `model_${model.version}.keras`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Artefacto ${filename} descargado`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No fue posible descargar el artefacto', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const counts = useMemo(() => {
    const base: Record<string, number> = { ALL: models.length };
    models.forEach((model) => {
      base[model.status] = (base[model.status] || 0) + 1;
    });
    return base;
  }, [models]);

  const filteredModels = useMemo(
    () => (statusFilter === 'ALL' ? models : models.filter((model) => model.status === statusFilter)),
    [models, statusFilter],
  );

  if (!activeProject) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <RegistryHeader onRefresh={handleRefresh} refreshing={refreshing} disabled />
        <ProjectRequired action="Seleccione un proyecto para consultar sus versiones de modelo inmutables." />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <Box className="w-4 h-4 text-zinc-700 dark:text-white/80" /> Módulo 08 • Registro de Modelos
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Gobernanza de Modelos &amp; Versionado Inmutable
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50 mt-0.5">
            Ciclo de vida DRAFT → REVIEWED → APPROVED → RETIRED con integridad criptográfica SHA-256.
            Proyecto activo: <strong className="text-zinc-700 dark:text-white/70">{activeProject.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 dark:text-white/45">
            Rol efectivo: <strong className="font-mono text-zinc-800 dark:text-white/80">{effectiveRole}</strong>
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-500 dark:text-white/50 font-medium px-1">Filtrar:</span>
        {(['ALL', 'DRAFT', 'REVIEWED', 'APPROVED', 'RETIRED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
              statusFilter === status
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {status === 'ALL' ? 'TODOS' : status} ({counts[status] || 0})
          </button>
        ))}
      </div>

      {loading && <LoadingBlock label="Cargando versiones de modelo…" />}

      {!loading && error && <ErrorBlock message={error} onRetry={() => loadModels()} />}

      {!loading && !error && filteredModels.length === 0 && (
        <EmptyBlock
          icon={Box}
          title={models.length === 0 ? 'Aún no hay versiones registradas' : 'Sin modelos para este estado'}
          description={
            models.length === 0
              ? 'Complete un entrenamiento exitoso en el módulo Entrenamientos. El worker creará automáticamente una versión inmutable con su checksum.'
              : 'Cambie el filtro para consultar otras versiones del registro.'
          }
        />
      )}

      <div className="space-y-3.5">
        {filteredModels.map((model) => {
          const highlights = metricHighlights(model.metricsSummary);
          const actions = lifecycleActions(model.status, effectiveRole);
          const task = model.metricsSummary?.task;
          return (
            <div key={model.id} className="glass-card p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl glass-inset text-zinc-900 dark:text-white flex items-center justify-center font-bold border border-black/10 dark:border-white/10 shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                        {model.version}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full glass-inset border ${STATUS_STYLES[model.status]}`}
                      >
                        {model.status === 'APPROVED' && <ShieldCheck className="w-3 h-3" />}
                        {model.status}
                      </span>
                      {task && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-inset border border-black/10 dark:border-white/10 text-zinc-600 dark:text-white/60">
                          {task}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-white/40 font-mono mt-1 truncate">
                      {model.storageKey}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-0.5">
                      Registrado {formatDateTime(model.createdAt)} · Job{' '}
                      <span className="font-mono">{shortId(model.jobId, 12)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {actions.map((action) => (
                    <button
                      key={action.target}
                      onClick={() => handleStatusChange(model, action.target)}
                      disabled={updatingId === model.id}
                      title={
                        action.allowed
                          ? `Mover a ${action.target}`
                          : `Requiere rol ADMIN o PROJECT_LEAD (RBAC)`
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium ${
                        action.allowed
                          ? 'glass-btn-secondary'
                          : 'glass-btn-secondary opacity-45 cursor-not-allowed'
                      } ${action.target === 'RETIRED' ? 'text-amber-700 dark:text-amber-300' : ''}`}
                    >
                      {!action.allowed && <Lock className="w-3 h-3" />}
                      {updatingId === model.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                      {action.label}
                    </button>
                  ))}

                  <button
                    onClick={() => handleDownload(model)}
                    disabled={downloadingId === model.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn-primary text-[11px] font-semibold disabled:opacity-50"
                  >
                    {downloadingId === model.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Descargar .keras
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl glass-inset border border-black/10 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <FileCheck2 className="w-3.5 h-3.5 text-zinc-500 dark:text-white/40 shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-white/40 tracking-wider shrink-0">
                    SHA-256
                  </span>
                  <code className="font-mono text-[11px] text-zinc-800 dark:text-white/80 truncate">
                    {model.checksum}
                  </code>
                </div>
                <button
                  onClick={() => copyChecksum(model.checksum, model.id)}
                  className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white shrink-0 self-end sm:self-auto font-medium"
                >
                  {copiedId === model.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Hash
                    </>
                  )}
                </button>
              </div>

              {highlights.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {highlights.map((item) => (
                    <div key={item.label} className="p-2.5 glass-inset rounded-xl">
                      <span className="text-zinc-500 dark:text-white/40 text-[10px] uppercase font-bold">
                        {item.label}
                      </span>
                      <p className="font-mono font-semibold text-zinc-900 dark:text-white mt-0.5">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-white/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Esta versión no tiene métricas de evaluación persistidas.
                </p>
              )}

              {model.metricsSummary?.datasetVersion && (
                <p className="text-[10px] text-zinc-500 dark:text-white/40 font-mono">
                  Dataset {model.metricsSummary.datasetVersion}
                  {model.metricsSummary.datasetChecksum
                    ? ` · checksum ${model.metricsSummary.datasetChecksum.slice(0, 16)}…`
                    : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RegistryHeader: React.FC<{ onRefresh: () => void; refreshing: boolean; disabled?: boolean }> = ({
  onRefresh,
  refreshing,
  disabled,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
    <div>
      <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
        <Box className="w-4 h-4 text-zinc-700 dark:text-white/80" /> Módulo 08 • Registro de Modelos
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
        Gobernanza de Modelos &amp; Versionado Inmutable
      </h1>
    </div>
    <button
      onClick={onRefresh}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium disabled:opacity-40"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar
    </button>
  </div>
);
