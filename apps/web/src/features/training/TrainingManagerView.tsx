import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlayCircle,
  StopCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Terminal,
  Sliders,
  Maximize2,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FolderGit2,
  Database,
  Radio,
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { ApiClient } from '../../lib/api';
import { useTrainingTelemetry } from '../../hooks/useTrainingTelemetry';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  ProjectRequired,
} from '../../components/common/ProjectGuard';
import {
  formatDateTime,
  formatDuration,
  formatMetric,
  formatPercent,
  shortId,
} from '../../lib/format';
import {
  Architecture,
  Dataset,
  JobStatus,
  TrainingJob,
  TrainingMetric,
} from '../../types';

const WRITE_ROLES = ['ADMIN', 'PROJECT_LEAD', 'AI_ENGINEER'];
const ACTIVE_STATES: JobStatus[] = ['QUEUED', 'PREPARING', 'RUNNING'];
const TERMINAL_STATES: JobStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];

const STATUS_STYLES: Record<JobStatus, string> = {
  QUEUED: 'text-zinc-700 dark:text-white/80 border-black/15 dark:border-white/20',
  PREPARING: 'text-amber-700 dark:text-amber-300 border-amber-500/30',
  RUNNING: 'text-sky-700 dark:text-sky-300 border-sky-500/30',
  COMPLETED: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  FAILED: 'text-rose-700 dark:text-rose-300 border-rose-500/30',
  CANCELLED: 'text-amber-700 dark:text-amber-300 border-amber-500/30',
};

function StatusPill({ status }: { status: JobStatus }) {
  const isActive = ACTIVE_STATES.includes(status);
  const isDone = status === 'COMPLETED';
  const isError = status === 'FAILED';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold glass-inset border ${STATUS_STYLES[status]}`}
    >
      {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
      {isDone && <CheckCircle2 className="w-3 h-3" />}
      {isError && <AlertTriangle className="w-3 h-3" />}
      {status}
    </span>
  );
}

interface ChartProps {
  metrics: TrainingMetric[];
  metric: 'loss' | 'accuracy';
  totalEpochs: number;
  isLarge?: boolean;
}

function MetricChart({ metrics, metric, totalEpochs, isLarge = false }: ChartProps) {
  const trainKey = metric;
  const valKey = metric === 'loss' ? 'valLoss' : 'valAccuracy';
  const trainValues = metrics
    .map((point) => point[trainKey])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (!trainValues.length) {
    return (
      <div className="h-28 flex items-center justify-center text-[11px] text-zinc-500 dark:text-white/40 font-mono">
        Esperando datos reales del worker…
      </div>
    );
  }

  const width = isLarge ? 720 : 260;
  const height = isLarge ? 280 : 100;
  const padding = isLarge ? 38 : 14;
  const maxEpoch = Math.max(totalEpochs, ...metrics.map((point) => point.epoch), 1);
  const allValues = metrics
    .flatMap((point) => [point[trainKey], point[valKey]])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  let minValue = Math.min(...allValues);
  let maxValue = Math.max(...allValues);
  if (metric === 'accuracy') {
    minValue = Math.min(0, minValue);
    maxValue = Math.max(1, maxValue);
  } else if (maxValue === minValue) {
    maxValue = minValue + 1;
  }
  const span = maxValue - minValue || 1;

  const project = (epoch: number, value: number) => {
    const x = padding + ((epoch - 1) / Math.max(1, maxEpoch - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - minValue) / span) * (height - 2 * padding);
    return [x, y] as const;
  };

  const trainPoints: string[] = [];
  const valPoints: string[] = [];
  metrics.forEach((point) => {
    const trainValue = point[trainKey];
    if (typeof trainValue === 'number' && Number.isFinite(trainValue)) {
      const [x, y] = project(point.epoch, trainValue);
      trainPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const valValue = point[valKey];
    if (typeof valValue === 'number' && Number.isFinite(valValue)) {
      const [x, y] = project(point.epoch, valValue);
      valPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
  });

  const lastTrainPoint = trainPoints[trainPoints.length - 1]?.split(',') || null;
  const formatAxis = (value: number) =>
    metric === 'accuracy' ? `${(value * 100).toFixed(0)}%` : value.toFixed(2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto overflow-visible select-none text-zinc-900 dark:text-white"
      role="img"
      aria-label={`Curva de ${metric}`}
    >
      <line
        x1={padding}
        y1={padding}
        x2={width - padding}
        y2={padding}
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeDasharray="3 3"
      />
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="currentColor"
        strokeOpacity="0.2"
      />

      {isLarge && (
        <>
          <text
            x={padding - 8}
            y={padding + 4}
            fontSize="10"
            textAnchor="end"
            fill="currentColor"
            opacity="0.45"
            fontFamily="monospace"
          >
            {formatAxis(maxValue)}
          </text>
          <text
            x={padding - 8}
            y={height - padding}
            fontSize="10"
            textAnchor="end"
            fill="currentColor"
            opacity="0.45"
            fontFamily="monospace"
          >
            {formatAxis(minValue)}
          </text>
          <text
            x={width - padding}
            y={height - padding + 16}
            fontSize="10"
            textAnchor="end"
            fill="currentColor"
            opacity="0.45"
            fontFamily="monospace"
          >
            Época {maxEpoch}
          </text>
          <text x={padding} y={height - padding + 16} fontSize="10" fill="currentColor" opacity="0.45">
            Época 1
          </text>
        </>
      )}

      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={isLarge ? '2.5' : '2'}
        points={trainPoints.join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {valPoints.length > 1 && (
        <polyline
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth={isLarge ? '2' : '1.5'}
          strokeDasharray="4 3"
          points={valPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {lastTrainPoint && (
        <circle
          cx={lastTrainPoint[0]}
          cy={lastTrainPoint[1]}
          r={isLarge ? '5' : '3.5'}
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export const TrainingManagerView: React.FC = () => {
  const { activeProject, currentRole, showToast } = useApp();
  const projectId = activeProject?.id;
  const canWrite = WRITE_ROLES.includes(currentRole);

  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [architectureId, setArchitectureId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [task, setTask] = useState<'classification' | 'regression' | ''>('');
  const [epochs, setEpochs] = useState(30);
  const [batchSize, setBatchSize] = useState(32);
  const [optimizer, setOptimizer] = useState<'adam' | 'sgd' | 'rmsprop'>('adam');
  const [learningRate, setLearningRate] = useState(0.001);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [enlargedModal, setEnlargedModal] = useState<'loss' | 'accuracy' | null>(null);

  const loadJobs = useCallback(async () => {
    if (!projectId) return [];
    const list = await ApiClient.listTrainingJobs(projectId);
    setJobs(list);
    setSelectedJobId((current) => {
      if (current && list.some((job) => job.id === current)) return current;
      return list[0]?.id ?? null;
    });
    return list;
  }, [projectId]);

  const loadAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [architectureList, datasetList] = await Promise.all([
        ApiClient.listArchitectures(projectId),
        ApiClient.listDatasets(projectId),
      ]);
      setArchitectures(architectureList);
      setDatasets(datasetList);
      await loadJobs();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar los datos del módulo');
    } finally {
      setLoading(false);
    }
  }, [projectId, loadJobs]);

  useEffect(() => {
    setArchitectures([]);
    setDatasets([]);
    setJobs([]);
    setSelectedJobId(null);
    setArchitectureId('');
    setDatasetId('');
    setTargetColumn('');
    setTask('');
    setFormError(null);
    if (projectId) void loadAll();
  }, [projectId, loadAll]);

  const selectedArchitecture = useMemo(
    () => architectures.find((item) => item.id === architectureId) || null,
    [architectures, architectureId],
  );
  const selectedDataset = useMemo(
    () => datasets.find((item) => item.id === datasetId) || null,
    [datasets, datasetId],
  );
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const handleArchitectureChange = (id: string) => {
    setArchitectureId(id);
    const architecture = architectures.find((item) => item.id === id);
    if (architecture) {
      setFormError(
        architecture.family === 'FEEDFORWARD'
          ? null
          : `La familia ${architecture.family} está documentada, pero el MVP sólo entrena Feedforward con CSV tabular.`,
      );
    }
  };

  const handleDatasetChange = (id: string) => {
    setDatasetId(id);
    const dataset = datasets.find((item) => item.id === id);
    if (dataset) {
      setTargetColumn(dataset.targetColumn || dataset.metadata.targetColumn || '');
      setTask(dataset.metadata.task || '');
    }
  };

  const telemetry = useTrainingTelemetry(selectedJob?.id ?? null, {
    totalEpochs: selectedJob?.hyperparameters.epochs,
    initialMetrics: selectedJob?.metrics ?? [],
    initialStatus: selectedJob?.status ?? null,
    initialProgress: selectedJob?.progress ?? 0,
  });

  const effectiveStatus = telemetry.status || selectedJob?.status || null;
  const progress =
    effectiveStatus === 'COMPLETED'
      ? 100
      : Math.max(telemetry.progress, selectedJob?.progress ?? 0);
  const metrics = telemetry.metrics;
  const latestMetric = metrics[metrics.length - 1];
  const hasAccuracy = metrics.some((point) => typeof point.accuracy === 'number');
  const totalEpochs = selectedJob?.hyperparameters.epochs ?? telemetry.totalEpochs;
  const isActive = effectiveStatus ? ACTIVE_STATES.includes(effectiveStatus) : false;

  // Refresca la lista (estado persistido) cuando el SSE confirma un final.
  useEffect(() => {
    if (!selectedJob || !telemetry.status) return;
    if (
      TERMINAL_STATES.includes(telemetry.status) &&
      selectedJob.status !== telemetry.status &&
      projectId
    ) {
      void loadJobs();
    }
  }, [telemetry.status, selectedJob, projectId, loadJobs]);

  // Mantiene la tabla al día mientras existan trabajos activos.
  useEffect(() => {
    if (!projectId) return;
    if (!jobs.some((job) => ACTIVE_STATES.includes(job.status))) return;
    const interval = window.setInterval(() => {
      void loadJobs();
    }, 8000);
    return () => window.clearInterval(interval);
  }, [jobs, projectId, loadJobs]);

  const handleStart = async () => {
    if (!projectId) return;
    if (!architectureId) {
      setFormError('Seleccione una arquitectura guardada');
      return;
    }
    if (!datasetId) {
      setFormError('Seleccione un dataset verificado');
      return;
    }
    if (!targetColumn.trim()) {
      setFormError('Indique la columna objetivo del dataset');
      return;
    }
    setStarting(true);
    setFormError(null);
    try {
      const job = await ApiClient.startTraining(projectId, {
        architectureId,
        datasetId,
        targetColumn: targetColumn.trim(),
        task: task || undefined,
        epochs,
        batchSize,
        optimizer,
        learningRate,
      });
      setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
      setSelectedJobId(job.id);
      showToast('Trabajo encolado. La telemetría se actualizará sin recargar la página.', 'success');
      await loadJobs();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No fue posible iniciar el entrenamiento',
      );
    } finally {
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedJob) return;
    if (!window.confirm(`¿Solicitar la cancelación del trabajo ${shortId(selectedJob.id)}?`)) {
      return;
    }
    setCancelling(true);
    try {
      await ApiClient.cancelTraining(selectedJob.id);
      showToast(
        'Cancelación registrada. El worker la aplicará al finalizar la época en curso.',
        'warning',
      );
      await telemetry.refresh();
      await loadJobs();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No fue posible cancelar el trabajo', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const logs = useMemo(() => {
    const lines: string[] = [];
    if (!selectedJob) return lines;
    lines.push(
      `[${formatDateTime(selectedJob.createdAt)}] Job ${shortId(selectedJob.id)} registrado con estado ${selectedJob.status}.`,
    );
    if (selectedJob.startedAt) {
      lines.push(`[${formatDateTime(selectedJob.startedAt)}] Worker inició la ejecución.`);
    }
    metrics.forEach((point) => {
      const parts = [`epoch ${point.epoch}/${totalEpochs}`];
      if (point.loss != null) parts.push(`loss=${formatMetric(point.loss)}`);
      if (point.accuracy != null) parts.push(`acc=${formatPercent(point.accuracy)}`);
      if (point.valLoss != null) parts.push(`val_loss=${formatMetric(point.valLoss)}`);
      if (point.valAccuracy != null) parts.push(`val_acc=${formatPercent(point.valAccuracy)}`);
      lines.push(parts.join(' · '));
    });
    if (selectedJob.endedAt) {
      lines.push(`[${formatDateTime(selectedJob.endedAt)}] Job finalizó como ${effectiveStatus}.`);
    }
    if (telemetry.errorMessage) {
      lines.push(`[ERROR] ${telemetry.errorMessage}`);
    }
    return lines.slice(-80);
  }, [selectedJob, metrics, totalEpochs, effectiveStatus, telemetry.errorMessage]);

  if (!activeProject) {
    return <ProjectRequired action="Seleccione un proyecto para iniciar y monitorear entrenamientos." />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4 text-zinc-800 dark:text-white/80" /> Módulo 06 •
            Orquestador de Entrenamientos
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Ejecución Asíncrona & Telemetría
          </h1>
          <p className="text-xs text-zinc-600 dark:text-white/50 mt-0.5">
            Entrenamiento real de TensorFlow/Keras en un worker aislado. La telemetría se persiste en
            PostgreSQL y llega por SSE con recuperación ante reconexiones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          {isActive ? (
            <button
              onClick={handleCancel}
              disabled={cancelling || !canWrite}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-300 border border-red-500/30 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4" /> {cancelling ? 'Solicitando…' : 'Cancelar Job'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={starting || !canWrite}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-primary text-xs font-semibold disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" /> {starting ? 'Encolando…' : 'Iniciar Entrenamiento'}
            </button>
          )}
        </div>
      </div>

      {error && <ErrorBlock message={error} onRetry={loadAll} />}
      {loading && <LoadingBlock label="Cargando arquitecturas, datasets y trabajos…" />}

      {!canWrite && (
        <div className="glass-card p-3 rounded-2xl border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Su rol ({currentRole}) permite consultar trabajos y métricas, pero no iniciar ni cancelar
          entrenamientos.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Job status */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-white/60">
                  Trabajo seleccionado:
                </span>
                {selectedJob ? (
                  <span className="font-mono text-xs text-zinc-900 dark:text-white">
                    {shortId(selectedJob.id, 12)}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-white/40">Ninguno</span>
                )}
                {effectiveStatus && <StatusPill status={effectiveStatus} />}
                {telemetry.isConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-300 font-medium">
                    <Radio className="w-3 h-3" /> SSE en vivo
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full glass-inset overflow-hidden border border-black/10 dark:border-white/10">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  effectiveStatus === 'FAILED'
                    ? 'bg-rose-500'
                    : effectiveStatus === 'CANCELLED'
                      ? 'bg-amber-500'
                      : 'bg-zinc-900 dark:bg-white'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>

            {selectedJob && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 dark:text-white/45 font-mono">
                <span>Creado: {formatDateTime(selectedJob.createdAt)}</span>
                <span>Duración: {formatDuration(selectedJob.startedAt, selectedJob.endedAt)}</span>
                <span>
                  Época: {telemetry.currentEpoch} / {totalEpochs || selectedJob.hyperparameters.epochs}
                </span>
                {telemetry.lastEventAt && (
                  <span>Último evento: {new Date(telemetry.lastEventAt).toLocaleTimeString()}</span>
                )}
              </div>
            )}

            {selectedJob?.errorMessage && (
              <p className="text-[11px] text-rose-600 dark:text-rose-300">{selectedJob.errorMessage}</p>
            )}
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Loss', value: formatMetric(latestMetric?.loss), tone: '' },
              { label: 'Accuracy', value: formatPercent(latestMetric?.accuracy), tone: '' },
              { label: 'Val Loss', value: formatMetric(latestMetric?.valLoss), tone: 'muted' },
              { label: 'Val Accuracy', value: formatPercent(latestMetric?.valAccuracy), tone: 'muted' },
            ].map((item) => (
              <div key={item.label} className="glass-card p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-500 dark:text-white/50 font-medium">
                  {item.label}
                </span>
                <div
                  className={`text-xl font-bold font-mono mt-1 ${
                    item.tone === 'muted'
                      ? 'text-zinc-700 dark:text-white/80'
                      : 'text-zinc-900 dark:text-white'
                  }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Start form */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Configuración del
                nuevo trabajo
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-white/45 font-mono">
                Seed determinista · split 70/15/15
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Arquitectura
                </label>
                <select
                  value={architectureId}
                  onChange={(event) => handleArchitectureChange(event.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  <option value="">Seleccione…</option>
                  {architectures.map((architecture) => (
                    <option key={architecture.id} value={architecture.id}>
                      {architecture.name} · {architecture.family} · v{architecture.version}
                    </option>
                  ))}
                </select>
                {architectures.length === 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-300 mt-1">
                    Guarde una arquitectura en el Diseñador para poder entrenar.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Dataset
                </label>
                <select
                  value={datasetId}
                  onChange={(event) => handleDatasetChange(event.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  <option value="">Seleccione…</option>
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} · {dataset.metadata.samples} filas
                    </option>
                  ))}
                </select>
                {datasets.length === 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-300 mt-1">
                    Suba un CSV validado en el módulo Datasets.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Columna objetivo
                </label>
                <select
                  value={targetColumn}
                  onChange={(event) => setTargetColumn(event.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                  disabled={!selectedDataset}
                >
                  <option value="">Seleccione…</option>
                  {(selectedDataset?.metadata.columns || []).map((column) => (
                    <option key={column.name} value={column.name}>
                      {column.name} · {column.dtype}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Tipo de tarea
                </label>
                <select
                  value={task}
                  onChange={(event) =>
                    setTask(event.target.value as 'classification' | 'regression' | '')
                  }
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  <option value="">Detectar desde el dataset</option>
                  <option value="classification">Clasificación</option>
                  <option value="regression">Regresión</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Épocas
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={epochs}
                  onChange={(event) => setEpochs(Math.max(1, parseInt(event.target.value, 10) || 1))}
                  className="w-full glass-input rounded-xl px-3 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Batch Size
                </label>
                <select
                  value={batchSize}
                  onChange={(event) => setBatchSize(parseInt(event.target.value, 10))}
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  {[8, 16, 32, 64, 128, 256].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Optimizador
                </label>
                <select
                  value={optimizer}
                  onChange={(event) =>
                    setOptimizer(event.target.value as 'adam' | 'sgd' | 'rmsprop')
                  }
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">
                  Learning Rate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.000001"
                  max="1"
                  value={learningRate}
                  onChange={(event) =>
                    setLearningRate(Math.max(0.000001, parseFloat(event.target.value) || 0.001))
                  }
                  className="w-full glass-input rounded-xl px-3 py-1.5 font-mono"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl glass-inset border border-rose-500/25 text-[11px] text-rose-600 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {formError}
              </div>
            )}
          </div>

          {/* Jobs table */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Historial de
                trabajos
              </h2>
              <span className="text-[10px] text-zinc-500 dark:text-white/40 font-mono">
                {jobs.length} registrados
              </span>
            </div>

            {jobs.length === 0 && !loading ? (
              <EmptyBlock
                title="Sin trabajos de entrenamiento"
                description="Configure arquitectura, dataset e hiperparámetros para encolar el primer job."
                icon={PlayCircle}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/40">
                      <th className="pb-2.5 font-medium">Job</th>
                      <th className="pb-2.5 font-medium">Arquitectura</th>
                      <th className="pb-2.5 font-medium">Dataset</th>
                      <th className="pb-2.5 font-medium">Estado</th>
                      <th className="pb-2.5 font-medium">Épocas</th>
                      <th className="pb-2.5 font-medium">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {jobs.map((job) => {
                      const architecture = architectures.find((item) => item.id === job.architectureId);
                      const dataset = datasets.find((item) => item.id === job.datasetId);
                      const isSelected = job.id === selectedJobId;
                      return (
                        <tr
                          key={job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-black/5 dark:bg-white/10'
                              : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <td className="py-2.5 font-mono text-zinc-700 dark:text-white/80">
                            {shortId(job.id)}
                          </td>
                          <td className="py-2.5 text-zinc-700 dark:text-white/70 max-w-[160px] truncate">
                            {architecture?.name || shortId(job.architectureId)}
                          </td>
                          <td className="py-2.5 text-zinc-600 dark:text-white/60 max-w-[150px] truncate">
                            {dataset?.name || shortId(job.datasetId)}
                          </td>
                          <td className="py-2.5">
                            <StatusPill status={job.status} />
                          </td>
                          <td className="py-2.5 font-mono text-zinc-600 dark:text-white/60">
                            {job.metrics.length}/{job.hyperparameters.epochs}
                          </td>
                          <td className="py-2.5 text-[10px] text-zinc-500 dark:text-white/45 font-mono whitespace-nowrap">
                            {formatDateTime(job.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Console */}
          <div className="glass-card p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" /> Salida del
                worker (datos persistidos + SSE)
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-white/50 font-mono">
                {telemetry.isConnected ? 'stream conectado' : 'sincronización por sondeo'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 text-zinc-200 border border-black/10 dark:border-white/10 font-mono text-[11px] max-h-40 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-zinc-500">Seleccione un trabajo para ver su traza.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-tight">
                    <span className="text-zinc-500 mr-2">&gt;</span>
                    <span className={log.includes('acc=') ? 'text-emerald-400' : 'text-zinc-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right dock */}
        <div className="space-y-3.5">
          <div className="text-xs font-medium text-zinc-600 dark:text-white/50 flex items-center justify-between px-1">
            <span>Telemetría gráfica</span>
            <span className="text-[10px] text-zinc-800 dark:text-white/70">Clic para ampliar</span>
          </div>

          <div
            onClick={() => setEnlargedModal('loss')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Curva de
                pérdida
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-zinc-900 dark:text-white font-medium">
                  {formatMetric(latestMetric?.loss)}
                </span>
                <Maximize2 className="w-3 h-3 text-zinc-400 dark:text-white/40" />
              </div>
            </div>
            <div className="p-2 glass-inset rounded-xl">
              <MetricChart metrics={metrics} metric="loss" totalEpochs={totalEpochs} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-white/40 px-0.5">
              <span>Train vs Val Loss</span>
              <span className="text-zinc-800 dark:text-white/70 font-medium">Ampliar →</span>
            </div>
          </div>

          <div
            onClick={() => hasAccuracy && setEnlargedModal('accuracy')}
            className={`glass-card p-4 rounded-2xl space-y-2 ${
              hasAccuracy ? 'glass-card-hover cursor-pointer' : 'opacity-70'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Curva de
                exactitud
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-zinc-900 dark:text-white font-medium">
                  {formatPercent(latestMetric?.accuracy)}
                </span>
                {hasAccuracy && <Maximize2 className="w-3 h-3 text-zinc-400 dark:text-white/40" />}
              </div>
            </div>
            <div className="p-2 glass-inset rounded-xl">
              {hasAccuracy ? (
                <MetricChart metrics={metrics} metric="accuracy" totalEpochs={totalEpochs} />
              ) : (
                <div className="h-28 flex items-center justify-center text-[11px] text-zinc-500 dark:text-white/40 font-mono">
                  No aplica para regresión
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-white/40 px-0.5">
              <span>Train vs Val Accuracy</span>
              <span className="text-zinc-800 dark:text-white/70 font-medium">
                {hasAccuracy ? 'Ampliar →' : '—'}
              </span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-xs space-y-2 text-zinc-600 dark:text-white/60">
            <span className="font-semibold text-zinc-900 dark:text-white/90 block border-b border-black/10 dark:border-white/10 pb-1.5">
              Contexto del trabajo
            </span>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <Cpu className="w-3 h-3" /> Arquitectura
              </span>
              <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[150px]">
                {selectedArchitecture?.name || (selectedJob ? shortId(selectedJob.architectureId) : '—')}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <Database className="w-3 h-3" /> Dataset
              </span>
              <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[150px]">
                {selectedDataset?.name || (selectedJob ? shortId(selectedJob.datasetId) : '—')}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <FolderGit2 className="w-3 h-3" /> Proyecto
              </span>
              <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[150px]">
                {activeProject.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Épocas configuradas</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white">
                {totalEpochs || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Optimizador</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white">
                {selectedJob?.hyperparameters.optimizer || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Learning rate</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white">
                {selectedJob?.hyperparameters.learningRate ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Batch size</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-white">
                {selectedJob?.hyperparameters.batchSize ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Última lectura</span>
              <span className="font-mono text-[10px] text-zinc-700 dark:text-white/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {telemetry.lastEventAt
                  ? new Date(telemetry.lastEventAt).toLocaleTimeString()
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EnlargedChartModal
        isOpen={enlargedModal !== null}
        onClose={() => setEnlargedModal(null)}
        title={
          enlargedModal === 'loss'
            ? 'Curva de Pérdida (Loss Convergence)'
            : 'Curva de Exactitud (Accuracy Progression)'
        }
        subtitle={
          enlargedModal === 'loss'
            ? 'Valores reales persistidos por época en entrenamiento y validación'
            : 'Evolución real de la exactitud sobre el conjunto de entrenamiento y validación'
        }
        badge={selectedJob ? `Job: ${shortId(selectedJob.id)}` : 'Sin job'}
      >
        <div className="space-y-4">
          <div className="p-4 glass-inset rounded-2xl border border-black/10 dark:border-white/10">
            {enlargedModal && (
              <MetricChart
                metrics={metrics}
                metric={enlargedModal}
                totalEpochs={totalEpochs}
                isLarge
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">
                Época actual
              </span>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {telemetry.currentEpoch} / {totalEpochs || '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">
                Último train
              </span>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {enlargedModal === 'loss'
                  ? formatMetric(latestMetric?.loss)
                  : formatPercent(latestMetric?.accuracy)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">
                Último val
              </span>
              <div className="text-base font-bold font-mono text-zinc-700 dark:text-white/80 mt-1">
                {enlargedModal === 'loss'
                  ? formatMetric(latestMetric?.valLoss)
                  : formatPercent(latestMetric?.valAccuracy)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">
                Estado
              </span>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {effectiveStatus || '—'}
              </div>
            </div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
