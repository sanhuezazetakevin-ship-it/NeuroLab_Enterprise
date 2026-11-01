import React, { useState, useEffect, useRef } from 'react';
import {
  PlayCircle,
  StopCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Clock,
  Terminal,
  Sliders,
  Check,
  Maximize2,
  FastForward,
  Cpu
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const TrainingManagerView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  // Job execution states
  const [status, setStatus] = useState<'IDLE' | 'PREPARING' | 'RUNNING' | 'COMPLETED' | 'CANCELLED'>('COMPLETED');
  const [currentEpoch, setCurrentEpoch] = useState(25);
  const [epochs, setEpochs] = useState(25);
  const [batchSize, setBatchSize] = useState(32);
  const [learningRate, setLearningRate] = useState(0.001);
  const [optimizer, setOptimizer] = useState<'adam' | 'sgd' | 'rmsprop'>('adam');
  const [speed, setSpeed] = useState<number>(2); // 1x, 2x, 5x

  // Metrics history
  const [metricsHistory, setMetricsHistory] = useState<any[]>(activeScenario.initialJob.metricsHistory || []);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] TensorFlow v2.16 backend initialized on worker CPU-01',
    `[INFO] Dataset ${activeScenario.dataset.name} loaded (${activeScenario.dataset.metadata.samples} samples)`,
    `[INFO] Model Architecture: ${activeScenario.architecture.family} compiled with Adam (lr=0.001)`,
    '[JOB] Job job-01 finished successfully in 25 epochs. Checksum generated.'
  ]);

  // Click-to-Enlarge Modal state ('loss' | 'accuracy' | null)
  const [enlargedModal, setEnlargedModal] = useState<'loss' | 'accuracy' | null>(null);

  const timerRef = useRef<any>(null);

  // Synchronize on scenario change
  useEffect(() => {
    const hist = activeScenario.initialJob.metricsHistory || [];
    setMetricsHistory(hist);
    setCurrentEpoch(hist.length || 25);
    setEpochs(Math.max(25, hist.length));
    setStatus('COMPLETED');
  }, [activeScenario]);

  // Start Training Routine
  const startTraining = () => {
    setStatus('PREPARING');
    setCurrentEpoch(0);
    setMetricsHistory([]);
    setLogs([
      `[INIT] Despachando tarea a Celery Worker...`,
      `[INFO] Inicializando tensores para arquitectura ${activeScenario.architecture.family}`,
      `[INFO] Optimizador: ${optimizer.toUpperCase()} (lr=${learningRate}), Batch Size: ${batchSize}`
    ]);

    setTimeout(() => {
      setStatus('RUNNING');
      showToast('Entrenamiento asíncrono iniciado en worker', 'info');
    }, 800);
  };

  // Cancel Training
  const cancelTraining = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('CANCELLED');
    setLogs((prev) => [...prev, '[WARN] Cancelación cooperativa solicitada por el usuario.', '[HALT] Worker detenido.']);
    showToast('Entrenamiento cancelado cooperativamente', 'warning');
  };

  // Instant complete
  const instantComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const hist = activeScenario.initialJob.metricsHistory || [];
    setMetricsHistory(hist);
    setCurrentEpoch(epochs);
    setStatus('COMPLETED');
    setLogs((prev: string[]) => [
      ...prev,
      `[FAST-FORWARD] Época ${epochs}/${epochs} alcanzada por simulación instantánea.`,
      `[SUCCESS] Modelo compilado y validado.`
    ]);
    showToast('Entrenamiento finalizado a velocidad ultra', 'success');
  };

  // Training loop simulation
  useEffect(() => {
    if (status !== 'RUNNING') return;

    const intervalMs = Math.max(120, 800 / speed);

    timerRef.current = setInterval(() => {
      setCurrentEpoch((prevEpoch) => {
        const nextEpoch = prevEpoch + 1;

        const baseLoss = 0.85 * Math.exp(-0.12 * nextEpoch) + 0.08 + (Math.random() * 0.02);
        const baseAcc = Math.min(0.965, 0.55 + 0.40 * (1 - Math.exp(-0.15 * nextEpoch)) + (Math.random() * 0.015));
        const valLoss = baseLoss + 0.03 + (Math.random() * 0.02);
        const valAcc = Math.max(0.5, baseAcc - 0.02 + (Math.random() * 0.01));

        const newMetric = {
          epoch: nextEpoch,
          loss: parseFloat(baseLoss.toFixed(4)),
          accuracy: parseFloat(baseAcc.toFixed(4)),
          valLoss: parseFloat(valLoss.toFixed(4)),
          valAccuracy: parseFloat(valAcc.toFixed(4)),
        };

        setMetricsHistory((prev: any[]) => [...prev, newMetric]);
        setLogs((prev: string[]) => [
          ...prev.slice(-30),
          `Epoch ${nextEpoch}/${epochs} - loss: ${newMetric.loss} - acc: ${(newMetric.accuracy * 100).toFixed(1)}% - val_loss: ${newMetric.valLoss} - val_acc: ${(newMetric.valAccuracy * 100).toFixed(1)}%`
        ]);

        if (nextEpoch >= epochs) {
          clearInterval(timerRef.current);
          setStatus('COMPLETED');
          showToast(`Entrenamiento completado: ${(newMetric.accuracy * 100).toFixed(1)}% accuracy`, 'success');
        }

        return nextEpoch;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, epochs, speed]);

  const latestMetric = metricsHistory[metricsHistory.length - 1] || {
    loss: 0.124,
    accuracy: 0.948,
    valLoss: 0.142,
    valAccuracy: 0.935,
  };

  const progress = epochs > 0 ? Math.min(100, Math.round((currentEpoch / epochs) * 100)) : 0;

  // Frosted Glass Monochrome SVG Chart Renderer
  const renderSVGChart = (metricType: 'loss' | 'accuracy', isLarge = false) => {
    if (metricsHistory.length === 0) {
      return (
        <div className="h-28 flex items-center justify-center text-[11px] text-white/40 font-mono">
          Esperando datos...
        </div>
      );
    }

    const width = isLarge ? 720 : 260;
    const height = isLarge ? 280 : 90;
    const padding = isLarge ? 35 : 12;
    const maxEpoch = Math.max(epochs, metricsHistory.length);

    const trainPoints: string[] = [];
    const valPoints: string[] = [];
    const areaPoints: string[] = [];

    metricsHistory.forEach((m: any, idx: number) => {
      const x = padding + ((m.epoch - 1) / (maxEpoch - 1)) * (width - 2 * padding);
      let valTrain = metricType === 'loss' ? m.loss : m.accuracy || 0;
      let valVal = metricType === 'loss' ? m.valLoss || m.loss : m.valAccuracy || m.accuracy || 0;

      const clampedTrain = Math.max(0, Math.min(1.0, valTrain));
      const clampedVal = Math.max(0, Math.min(1.0, valVal));

      const yTrain = (height - padding) - clampedTrain * (height - 2 * padding);
      const yVal = (height - padding) - clampedVal * (height - 2 * padding);

      trainPoints.push(`${x.toFixed(1)},${yTrain.toFixed(1)}`);
      valPoints.push(`${x.toFixed(1)},${yVal.toFixed(1)}`);
      areaPoints.push(`${x.toFixed(1)},${yTrain.toFixed(1)}`);
    });

    const firstX = padding;
    const lastX = padding + ((metricsHistory[metricsHistory.length - 1].epoch - 1) / (maxEpoch - 1)) * (width - 2 * padding);
    const bottomY = height - padding;
    const areaD = `M ${firstX},${bottomY} L ${areaPoints.join(' L ')} L ${lastX},${bottomY} Z`;

    const gradientId = `glass-grad-${metricType}-${isLarge ? 'lg' : 'sm'}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isLarge ? "0.15" : "0.20"} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.15)" />

        {isLarge && (
          <>
            <text x={padding - 8} y={padding + 5} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="monospace">1.0</text>
            <text x={padding - 8} y={height / 2 + 3} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="monospace">0.5</text>
            <text x={padding - 8} y={height - padding} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="monospace">0.0</text>
            <text x={width - padding} y={height - padding + 15} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="monospace">Época {maxEpoch}</text>
          </>
        )}

        {/* Area fill under train curve */}
        {areaPoints.length > 1 && (
          <path d={areaD} fill={`url(#${gradientId})`} />
        )}

        {/* Train Line (Crisp White Stroke) */}
        <polyline
          fill="none"
          stroke="#ffffff"
          strokeWidth={isLarge ? "2.5" : "2"}
          points={trainPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Validation Line (Frosted Silver Dashed Stroke) */}
        <polyline
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={isLarge ? "2" : "1.5"}
          strokeDasharray="4 3"
          points={valPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Active Dot */}
        {trainPoints.length > 0 && (
          <circle
            cx={trainPoints[trainPoints.length - 1].split(',')[0]}
            cy={trainPoints[trainPoints.length - 1].split(',')[1]}
            r={isLarge ? "5" : "3.5"}
            fill="#ffffff"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="1.5"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4 text-white/80" /> Módulo 06 • Orquestador de Entrenamientos
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white dark:text-white light:text-zinc-900 mt-1">
            Ejecución Asíncrona & Telemetría
          </h1>
          <p className="text-xs text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">
            Worker desacoplado con TensorFlow/Keras. Las telemetrías se persisten en base de datos para tolerar recargas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'RUNNING' && (
            <button
              onClick={instantComplete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
            >
              <FastForward className="w-3.5 h-3.5" /> Completar Rápido
            </button>
          )}

          {status === 'RUNNING' || status === 'PREPARING' ? (
            <button
              onClick={cancelTraining}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-medium transition-colors"
            >
              <StopCircle className="w-4 h-4" /> Cancelar Job
            </button>
          ) : (
            <button
              onClick={startTraining}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-btn-primary text-xs font-semibold"
            >
              <PlayCircle className="w-4 h-4" /> Iniciar Entrenamiento
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Primary Workspace (Left 2 cols) + Right Compact Charts Dock (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Controls, Progress, Gauges & Console (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Bar & Status Pill */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/60 dark:text-white/60 light:text-zinc-600">Estado del Job:</span>
                {status === 'PREPARING' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs glass-inset text-white/90 border border-white/10 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> PREPARING
                  </span>
                )}
                {status === 'RUNNING' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs glass-inset text-white border border-white/20 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> RUNNING (Época {currentEpoch} / {epochs})
                  </span>
                )}
                {status === 'COMPLETED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs glass-inset text-white border border-white/20 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> COMPLETED (100%)
                  </span>
                )}
                {status === 'CANCELLED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30 font-medium flex items-center gap-1">
                    <StopCircle className="w-3 h-3" /> CANCELLED
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-semibold text-white dark:text-white light:text-zinc-900">{progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full glass-inset overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status === 'CANCELLED' ? 'bg-red-400' : 'bg-white'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500">Pérdida (Loss)</span>
              <div className="text-xl font-bold font-mono text-white dark:text-white light:text-zinc-900 mt-1">
                {latestMetric.loss ? latestMetric.loss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500">Exactitud (Acc)</span>
              <div className="text-xl font-bold font-mono text-white dark:text-white light:text-zinc-900 mt-1">
                {latestMetric.accuracy ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500">Val Loss</span>
              <div className="text-xl font-bold font-mono text-white/80 dark:text-white/80 light:text-zinc-800 mt-1">
                {latestMetric.valLoss ? latestMetric.valLoss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500">Val Accuracy</span>
              <div className="text-xl font-bold font-mono text-white/80 dark:text-white/80 light:text-zinc-800 mt-1">
                {latestMetric.valAccuracy ? `${(latestMetric.valAccuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>

          {/* Hyperparameters Config Row */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-white/70" /> Parámetros de Ejecución
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/50">Velocidad:</span>
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                      speed === s
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {s}&times;
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-white/50 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">Épocas</label>
                <input
                  type="number"
                  value={epochs}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-white/50 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">Batch Size</label>
                <select
                  value={batchSize}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white"
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                </select>
              </div>

              <div>
                <label className="block text-white/50 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">Optimizador</label>
                <select
                  value={optimizer}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setOptimizer(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
              </div>

              <div>
                <label className="block text-white/50 dark:text-white/50 text-[10px] uppercase font-bold mb-1.5">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={learningRate}
                  disabled={status === 'RUNNING'}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Streaming Console Terminal */}
          <div className="glass-card p-5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-white/60" /> Salida de Consola (Worker Telemetry)
              </span>
              <span className="text-[10px] text-white/50 font-mono">Stream WebSocket Activo</span>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset font-mono text-[11px] text-white/80 max-h-36 overflow-y-auto space-y-1">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-tight">
                  <span className="text-white/40 mr-2">&gt;</span>
                  <span className={log.includes('acc:') ? 'text-white font-semibold' : 'text-white/70'}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT DOCK: Compact Clickable Preview Cards (1/3 width) */}
        <div className="space-y-3.5">
          <div className="text-xs font-medium text-white/50 dark:text-white/50 light:text-zinc-500 flex items-center justify-between px-1">
            <span>Telemetría Gráfica (Dock)</span>
            <span className="text-[10px] text-white/70">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Loss Curve */}
          <div
            onClick={() => setEnlargedModal('loss')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-white/70" /> Curva de Pérdida
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-white/90 font-medium">
                  {latestMetric.loss ? latestMetric.loss.toFixed(4) : '-'}
                </span>
                <Maximize2 className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
              </div>
            </div>

            <div className="p-2 glass-inset rounded-xl">
              {renderSVGChart('loss', false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5">
              <span>Train vs Val Loss</span>
              <span className="text-white/70 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Accuracy Curve */}
          <div
            onClick={() => setEnlargedModal('accuracy')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-white/70" /> Curva de Exactitud
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-white font-medium">
                  {latestMetric.accuracy ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '-'}
                </span>
                <Maximize2 className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
              </div>
            </div>

            <div className="p-2 glass-inset rounded-xl">
              {renderSVGChart('accuracy', false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5">
              <span>Train vs Val Accuracy</span>
              <span className="text-white/70 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Run Metadata */}
          <div className="glass-card p-4 rounded-2xl text-xs space-y-2 text-white/60 dark:text-white/60 light:text-zinc-600">
            <div className="flex justify-between">
              <span>Modelo:</span>
              <span className="font-medium text-white dark:text-white light:text-zinc-800 truncate max-w-[140px]">{activeScenario.architecture.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Dataset:</span>
              <span className="font-medium text-white dark:text-white light:text-zinc-800 truncate max-w-[140px]">{activeScenario.dataset.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Tiempo / Época:</span>
              <span className="font-mono font-medium text-white dark:text-white light:text-zinc-800">~38 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED CHART MODAL */}
      <EnlargedChartModal
        isOpen={enlargedModal !== null}
        onClose={() => setEnlargedModal(null)}
        title={enlargedModal === 'loss' ? 'Curva de Pérdida (Loss Convergence)' : 'Curva de Exactitud (Accuracy Progression)'}
        subtitle={enlargedModal === 'loss' ? 'Comportamiento de la función de coste a través de las épocas de entrenamiento' : 'Evolución de la exactitud sobre lotes de entrenamiento y conjunto de validación'}
        badge={`Job: ${activeScenario.initialJob.id.slice(0, 8)}`}
      >
        <div className="space-y-4">
          <div className="p-4 glass-inset rounded-2xl border border-white/10">
            {enlargedModal && renderSVGChart(enlargedModal, true)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl glass-inset border border-white/10">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Época Actual</span>
              <div className="text-base font-bold font-mono text-white mt-1">{currentEpoch} / {epochs}</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-white/10">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Último Valor Train</span>
              <div className="text-base font-bold font-mono text-white mt-1">
                {enlargedModal === 'loss' ? latestMetric.loss.toFixed(4) : `${((latestMetric.accuracy ?? 0) * 100).toFixed(1)}%`}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-white/10">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Último Valor Val</span>
              <div className="text-base font-bold font-mono text-white/80 mt-1">
                {enlargedModal === 'loss' ? (latestMetric.valLoss || 0).toFixed(4) : `${((latestMetric.valAccuracy || 0) * 100).toFixed(1)}%`}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-inset border border-white/10">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Divergencia (Overfit)</span>
              <div className="text-base font-bold font-mono text-white mt-1">&lt; 0.02 (Estable)</div>
            </div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
