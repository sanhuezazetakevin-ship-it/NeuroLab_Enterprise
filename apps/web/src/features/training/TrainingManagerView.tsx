import React, { useState, useEffect, useRef } from 'react';
import {
  PlayCircle,
  StopCircle,
  Activity,
  CheckCircle2,
  Clock,
  Sliders,
  TrendingDown,
  TrendingUp,
  Cpu,
  Database,
  Terminal,
  FastForward,
  Maximize2
} from 'lucide-react';
import { TrainingMetric, JobStatus } from '../../types';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const TrainingManagerView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [epochs, setEpochs] = useState(activeScenario.initialJob.hyperparameters.epochs);
  const [batchSize, setBatchSize] = useState(activeScenario.initialJob.hyperparameters.batchSize);
  const [optimizer, setOptimizer] = useState<'adam' | 'sgd' | 'rmsprop'>(
    activeScenario.initialJob.hyperparameters.optimizer as any
  );
  const [learningRate, setLearningRate] = useState(activeScenario.initialJob.hyperparameters.learningRate);

  const [status, setStatus] = useState<JobStatus>(activeScenario.initialJob.status);
  const [currentEpoch, setCurrentEpoch] = useState(activeScenario.initialJob.hyperparameters.epochs);
  const [progress, setProgress] = useState(activeScenario.initialJob.progress);
  const [speed, setSpeed] = useState<number>(1);

  const [metricsHistory, setMetricsHistory] = useState<TrainingMetric[]>(
    activeScenario.initialJob.metricsHistory || []
  );

  const [logs, setLogs] = useState<string[]>([
    `[INFO] Keras: Modelo compilado exitosamente (${activeScenario.architecture.name})`,
    `[INFO] Dataset: ${activeScenario.dataset.name} (${activeScenario.dataset.metadata.samples.toLocaleString()} filas)`,
    `[INFO] Worker: TensorFlow 2.15 (Host PID: 8192)`,
    `[INFO] Optimizador: ${activeScenario.initialJob.hyperparameters.optimizer.toUpperCase()} (lr=${activeScenario.initialJob.hyperparameters.learningRate})`,
    `[OK] 25/25 épocas completadas | Exactitud Test: 94.8%`
  ]);

  // Modal enlargement state
  const [enlargedModal, setEnlargedModal] = useState<'loss' | 'accuracy' | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    setEpochs(activeScenario.initialJob.hyperparameters.epochs);
    setBatchSize(activeScenario.initialJob.hyperparameters.batchSize);
    setOptimizer(activeScenario.initialJob.hyperparameters.optimizer as any);
    setLearningRate(activeScenario.initialJob.hyperparameters.learningRate);
    setStatus(activeScenario.initialJob.status);
    setProgress(activeScenario.initialJob.progress);
    setCurrentEpoch(activeScenario.initialJob.hyperparameters.epochs);
    setMetricsHistory(activeScenario.initialJob.metricsHistory || []);
  }, [activeScenario]);

  const startTraining = () => {
    setStatus('PREPARING');
    setCurrentEpoch(0);
    setProgress(0);
    setMetricsHistory([]);
    setLogs([
      `[INFO] Trabajo encolado en Redis...`,
      `[INFO] Worker asíncrono asignado (Status: PREPARING)`,
      `[INFO] Inicializando tensores Keras...`,
      `[INFO] Máquina de estados: RUNNING. Época 1 de ${epochs}...`
    ]);

    showToast('Entrenamiento encolado en worker TensorFlow', 'info');

    setTimeout(() => {
      setStatus('RUNNING');
      let ep = 0;
      let currLoss = 0.76;
      let currAcc = 0.53;
      const intervalMs = Math.max(100, Math.floor(600 / speed));

      timerRef.current = setInterval(() => {
        ep += 1;
        currLoss = Math.max(0.04, Number((currLoss * 0.90 + (Math.random() * 0.02 - 0.01)).toFixed(4)));
        currAcc = Math.min(0.99, Number((currAcc + (1.0 - currAcc) * 0.08 + (Math.random() * 0.02 - 0.01)).toFixed(4)));

        const valLoss = Number((currLoss * (1.0 + Math.random() * 0.07)).toFixed(4));
        const valAcc = Number((currAcc * (1.0 - Math.random() * 0.03)).toFixed(4));

        const newMetric: TrainingMetric = {
          epoch: ep,
          loss: currLoss,
          accuracy: currAcc,
          valLoss: valLoss,
          valAccuracy: valAcc,
        };

        setCurrentEpoch(ep);
        setProgress(Math.round((ep / epochs) * 100));
        setMetricsHistory((prev) => [...prev, newMetric]);

        const logEntry = `Epoch ${ep}/${epochs} - loss: ${currLoss.toFixed(4)} - acc: ${(currAcc * 100).toFixed(1)}% - val_loss: ${valLoss.toFixed(4)} - val_acc: ${(valAcc * 100).toFixed(1)}%`;
        setLogs((prev) => [...prev.slice(-12), logEntry]);

        if (ep >= epochs) {
          clearInterval(timerRef.current);
          setStatus('COMPLETED');
          showToast(`Entrenamiento finalizado exitosamente`, 'success');
        }
      }, intervalMs);
    }, 700);
  };

  const cancelTraining = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('CANCELLED');
    setLogs((prev) => [...prev, `[CANCELLED] Cancelación cooperativa confirmada por worker.`]);
    showToast('Entrenamiento cancelado cooperativamente', 'warning');
  };

  const instantComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('COMPLETED');
    setCurrentEpoch(epochs);
    setProgress(100);
    setMetricsHistory(activeScenario.initialJob.metricsHistory || []);
    showToast('Entrenamiento completado en modo simulación rápida', 'success');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const latestMetric = metricsHistory[metricsHistory.length - 1] || {
    loss: 0.162,
    accuracy: 0.948,
    valLoss: 0.162,
    valAccuracy: 0.948,
  };

  // Helper to render SVG Chart (both compact and enlarged)
  const renderSVGChart = (metricType: 'loss' | 'accuracy', isLarge = false) => {
    if (metricsHistory.length < 2) {
      return (
        <div className="h-28 flex items-center justify-center text-[11px] text-slate-400 font-mono">
          Esperando datos...
        </div>
      );
    }

    const width = isLarge ? 720 : 260;
    const height = isLarge ? 300 : 100;
    const padding = isLarge ? 40 : 14;
    const maxEpoch = Math.max(epochs, metricsHistory.length);

    const trainPoints: string[] = [];
    const valPoints: string[] = [];

    metricsHistory.forEach((m) => {
      const x = padding + ((m.epoch - 1) / (maxEpoch - 1)) * (width - 2 * padding);
      let valTrain = metricType === 'loss' ? m.loss : m.accuracy || 0;
      let valVal = metricType === 'loss' ? m.valLoss || m.loss : m.valAccuracy || m.accuracy || 0;

      const clampedTrain = Math.max(0, Math.min(1.0, valTrain));
      const clampedVal = Math.max(0, Math.min(1.0, valVal));

      const yTrain = (height - padding) - clampedTrain * (height - 2 * padding);
      const yVal = (height - padding) - clampedVal * (height - 2 * padding);

      trainPoints.push(`${x.toFixed(1)},${yTrain.toFixed(1)}`);
      valPoints.push(`${x.toFixed(1)},${yVal.toFixed(1)}`);
    });

    const isLoss = metricType === 'loss';
    const trainColor = isLoss ? '#2563eb' : '#059669'; // Clean corporate blue / emerald
    const valColor = isLoss ? '#d97706' : '#0891b2'; // Subtle amber / cyan

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Subtle grid */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" className="dark:stroke-slate-700" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" className="dark:stroke-slate-700" />

        {isLarge && (
          <>
            <text x={padding - 8} y={padding + 5} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">1.0</text>
            <text x={padding - 8} y={height / 2 + 3} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">0.5</text>
            <text x={padding - 8} y={height - padding} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">0.0</text>
            <text x={width - padding} y={height - padding + 15} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">Época {maxEpoch}</text>
          </>
        )}

        {/* Train Line */}
        <polyline
          fill="none"
          stroke={trainColor}
          strokeWidth={isLarge ? "3" : "2"}
          points={trainPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Validation Line */}
        <polyline
          fill="none"
          stroke={valColor}
          strokeWidth={isLarge ? "2.5" : "1.5"}
          strokeDasharray="4 3"
          points={valPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Dot */}
        {trainPoints.length > 0 && (
          <circle
            cx={trainPoints[trainPoints.length - 1].split(',')[0]}
            cy={trainPoints[trainPoints.length - 1].split(',')[1]}
            r={isLarge ? "5" : "3.5"}
            fill={trainColor}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4" /> Módulo 06 • Orquestador de Entrenamientos
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Ejecución Asíncrona & Telemetría
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Worker desacoplado con TensorFlow/Keras. Las telemetrías se persisten en base de datos para tolerar recargas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'RUNNING' && (
            <button
              onClick={instantComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
            >
              <FastForward className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Completar Rápido
            </button>
          )}

          {status === 'RUNNING' || status === 'PREPARING' ? (
            <button
              onClick={cancelTraining}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-semibold text-xs transition-colors"
            >
              <StopCircle className="w-4 h-4" /> Cancelar Job
            </button>
          ) : (
            <button
              onClick={startTraining}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <PlayCircle className="w-4 h-4" /> Iniciar Entrenamiento
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Primary Workspace (Left 2 cols) + Right Compact Charts Dock (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Controls, Progress, Gauges & Console (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Bar & Status Pill */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estado del Job:</span>
                {status === 'PREPARING' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> PREPARING
                  </span>
                )}
                {status === 'RUNNING' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> RUNNING (Época {currentEpoch} / {epochs})
                  </span>
                )}
                {status === 'COMPLETED' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETED (100%)
                  </span>
                )}
                {status === 'CANCELLED' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-medium flex items-center gap-1">
                    <StopCircle className="w-3 h-3" /> CANCELLED
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">{progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Pérdida (Loss)</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {latestMetric.loss ? latestMetric.loss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Exactitud (Acc)</span>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {latestMetric.accuracy ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Val Loss</span>
              <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {latestMetric.valLoss ? latestMetric.valLoss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Val Accuracy</span>
              <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {latestMetric.valAccuracy ? `${(latestMetric.valAccuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>

          {/* Hyperparameters Config Row */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Parámetros de Ejecución
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Velocidad:</span>
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      speed === s
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {s}&times;
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Épocas</label>
                <input
                  type="number"
                  value={epochs}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Batch Size</label>
                <select
                  value={batchSize}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white"
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Optimizador</label>
                <select
                  value={optimizer}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setOptimizer(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={learningRate}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Streaming Console Terminal */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Salida de Consola (Worker Telemetry)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Stream WebSocket Activo</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1 border border-slate-900">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-tight">
                  <span className="text-slate-600 mr-2">&gt;</span>
                  <span className={log.includes('acc:') ? 'text-emerald-400' : 'text-slate-300'}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT DOCK: Compact Clickable Preview Cards (1/3 width) */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>Telemetría Gráfica (Miniaturas)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Loss Curve */}
          <div
            onClick={() => setEnlargedModal('loss')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Curva de Pérdida
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                  {latestMetric.loss ? latestMetric.loss.toFixed(4) : '-'}
                </span>
                <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-1" />
              </div>
            </div>

            <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              {renderSVGChart('loss', false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Train vs Val Loss</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Accuracy Curve */}
          <div
            onClick={() => setEnlargedModal('accuracy')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Curva de Exactitud
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {latestMetric.accuracy ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '-'}
                </span>
                <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-1" />
              </div>
            </div>

            <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              {renderSVGChart('accuracy', false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Train vs Val Accuracy</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Run Metadata */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400 shadow-xs">
            <div className="flex justify-between">
              <span>Modelo:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{activeScenario.architecture.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Dataset:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{activeScenario.dataset.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiempo / Época:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">~38 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED CHART MODAL (Triggered on click) */}
      <EnlargedChartModal
        isOpen={enlargedModal !== null}
        onClose={() => setEnlargedModal(null)}
        title={enlargedModal === 'loss' ? 'Curva de Pérdida (Loss Convergence)' : 'Curva de Exactitud (Accuracy Progression)'}
        subtitle={enlargedModal === 'loss' ? 'Comportamiento de la función de coste a través de las épocas de entrenamiento' : 'Evolución de la exactitud sobre lotes de entrenamiento y conjunto de validación'}
        badge={`Job: ${activeScenario.initialJob.id.slice(0, 8)}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {enlargedModal && renderSVGChart(enlargedModal, true)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Época Actual</span>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{currentEpoch} / {epochs}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Último Valor Train</span>
              <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {enlargedModal === 'loss' ? latestMetric.loss.toFixed(4) : `${((latestMetric.accuracy ?? 0) * 100).toFixed(1)}%`}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Último Valor Val</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {enlargedModal === 'loss' ? (latestMetric.valLoss || 0).toFixed(4) : `${((latestMetric.valAccuracy || 0) * 100).toFixed(1)}%`}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Divergencia (Overfit)</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">&lt; 0.02 (Estable)</div>
            </div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
