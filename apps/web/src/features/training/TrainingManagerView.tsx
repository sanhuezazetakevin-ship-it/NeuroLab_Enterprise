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
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { TrainingMetric, JobStatus } from '../../types';
import { useDemo } from '../../lib/DemoContext';

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
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x

  const [metricsHistory, setMetricsHistory] = useState<TrainingMetric[]>(
    activeScenario.initialJob.metricsHistory || []
  );

  const [logs, setLogs] = useState<string[]>([
    `[INFO] Keras Engine: Modelo compilado exitosamente (${activeScenario.architecture.name})`,
    `[INFO] Dataset cargado: ${activeScenario.dataset.name} con ${activeScenario.dataset.metadata.samples.toLocaleString()} filas`,
    `[INFO] Worker asignado: TensorFlow 2.15 (Host PID: 8192)`,
    `[INFO] Optimizador: ${activeScenario.initialJob.hyperparameters.optimizer.toUpperCase()} (lr=${activeScenario.initialJob.hyperparameters.learningRate})`,
    `[OK] Épocas finalizadas: 25/25 | Exactitud Test: 94.8%`
  ]);

  const timerRef = useRef<any>(null);

  // Sync with active scenario changes
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
      `[INFO] Solicitud recibida: Encolando trabajo en Redis...`,
      `[INFO] Worker asíncrono tomó el trabajo de la cola (Status: PREPARING)`,
      `[INFO] Compilando grafo Keras con ${activeScenario.architecture.family}...`,
      `[INFO] Máquina de estados: RUNNING. Iniciando época 1 de ${epochs}...`
    ]);

    showToast('Entrenamiento encolado y worker TensorFlow iniciado', 'info');

    setTimeout(() => {
      setStatus('RUNNING');

      let ep = 0;
      let currLoss = 0.78;
      let currAcc = 0.54;

      const intervalMs = Math.max(100, Math.floor(600 / speed));

      timerRef.current = setInterval(() => {
        ep += 1;
        currLoss = Math.max(0.04, Number((currLoss * 0.90 + (Math.random() * 0.02 - 0.01)).toFixed(4)));
        currAcc = Math.min(0.99, Number((currAcc + (1.0 - currAcc) * 0.08 + (Math.random() * 0.02 - 0.01)).toFixed(4)));

        const valLoss = Number((currLoss * (1.0 + Math.random() * 0.08)).toFixed(4));
        const valAcc = Number((currAcc * (1.0 - Math.random() * 0.04)).toFixed(4));

        const newMetric: TrainingMetric = {
          epoch: ep,
          loss: currLoss,
          accuracy: currAcc,
          valLoss: valLoss,
          valAccuracy: valAcc,
        };

        setCurrentEpoch(ep);
        const currentProg = Math.round((ep / epochs) * 100);
        setProgress(currentProg);
        setMetricsHistory((prev) => [...prev, newMetric]);

        const logEntry = `Epoch ${ep}/${epochs} - loss: ${currLoss.toFixed(4)} - acc: ${(currAcc * 100).toFixed(1)}% - val_loss: ${valLoss.toFixed(4)} - val_acc: ${(valAcc * 100).toFixed(1)}%`;
        setLogs((prev) => [...prev.slice(-15), logEntry]);

        if (ep >= epochs) {
          clearInterval(timerRef.current);
          setStatus('COMPLETED');
          showToast(`¡Entrenamiento de ${activeScenario.architecture.name} completado con éxito!`, 'success');
        }
      }, intervalMs);
    }, 800);
  };

  const cancelTraining = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('CANCELLED');
    setLogs((prev) => [...prev, `[CANCELLED] Solicitud cooperativa confirmada por el worker.`]);
    showToast('Entrenamiento cancelado cooperativamente por el usuario', 'warning');
  };

  const instantComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('COMPLETED');
    setCurrentEpoch(epochs);
    setProgress(100);
    setMetricsHistory(activeScenario.initialJob.metricsHistory || []);
    showToast('Entrenamiento completado en modo demo instantáneo', 'success');
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

  // Helper to draw SVG Charts
  const renderSVGChart = (metricType: 'loss' | 'accuracy') => {
    if (metricsHistory.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
          Esperando telemetría de época...
        </div>
      );
    }

    const width = 360;
    const height = 140;
    const padding = 25;
    const maxEpoch = Math.max(epochs, metricsHistory.length);

    // Compute points
    const trainPoints: string[] = [];
    const valPoints: string[] = [];

    metricsHistory.forEach((m) => {
      const x = padding + ((m.epoch - 1) / (maxEpoch - 1)) * (width - 2 * padding);
      let valTrain = metricType === 'loss' ? m.loss : m.accuracy || 0;
      let valValidation = metricType === 'loss' ? m.valLoss || m.loss : m.valAccuracy || m.accuracy || 0;

      // Scaling:
      // Loss range [0, 1.0] -> y [height - padding, padding]
      // Accuracy range [0, 1.0] -> y [height - padding, padding]
      const clampedTrain = Math.max(0, Math.min(1.0, valTrain));
      const clampedVal = Math.max(0, Math.min(1.0, valValidation));

      const yTrain = (height - padding) - clampedTrain * (height - 2 * padding);
      const yVal = (height - padding) - clampedVal * (height - 2 * padding);

      trainPoints.push(`${x.toFixed(1)},${yTrain.toFixed(1)}`);
      valPoints.push(`${x.toFixed(1)},${yVal.toFixed(1)}`);
    });

    const isLoss = metricType === 'loss';
    const trainColor = isLoss ? '#10b981' : '#6366f1';
    const valColor = isLoss ? '#f59e0b' : '#06b6d4';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />

        {/* Train Line */}
        <polyline
          fill="none"
          stroke={trainColor}
          strokeWidth="2.5"
          points={trainPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Validation Line */}
        <polyline
          fill="none"
          stroke={valColor}
          strokeWidth="2"
          strokeDasharray="4 3"
          points={valPoints.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest dots */}
        {trainPoints.length > 0 && (
          <>
            <circle
              cx={trainPoints[trainPoints.length - 1].split(',')[0]}
              cy={trainPoints[trainPoints.length - 1].split(',')[1]}
              r="4.5"
              fill={trainColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle
              cx={valPoints[valPoints.length - 1].split(',')[0]}
              cy={valPoints[valPoints.length - 1].split(',')[1]}
              r="4"
              fill={valColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4" /> Módulo 06 • Orquestador de Entrenamientos
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Ejecución Asíncrona & Telemetría en Tiempo Real
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Workers en subproceso con TensorFlow/Keras. Telemetría de épocas sin recargar la pantalla.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'RUNNING' && (
            <button
              onClick={instantComplete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <FastForward className="w-3.5 h-3.5 text-indigo-400" /> Completar Rápido
            </button>
          )}

          {status === 'RUNNING' || status === 'PREPARING' ? (
            <button
              onClick={cancelTraining}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold text-xs transition-colors"
            >
              <StopCircle className="w-4 h-4" /> Cancelar Entrenamiento
            </button>
          ) : (
            <button
              onClick={startTraining}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <PlayCircle className="w-4 h-4" /> Iniciar Entrenamiento con TensorFlow
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Hyperparameters & Live Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hyperparameters & Details */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Hiperparámetros Keras
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">keras.Model.fit()</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Épocas de Entrenamiento</label>
              <input
                type="number"
                value={epochs}
                disabled={status === 'RUNNING'}
                onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tamaño de Lote (Batch Size)</label>
              <select
                value={batchSize}
                disabled={status === 'RUNNING'}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={16}>16 muestras / paso</option>
                <option value={32}>32 muestras / paso</option>
                <option value={64}>64 muestras / paso</option>
                <option value={128}>128 muestras / paso</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Optimizador</label>
              <select
                value={optimizer}
                disabled={status === 'RUNNING'}
                onChange={(e) => setOptimizer(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="adam">Adam (Adaptive Moment Estimation)</option>
                <option value="sgd">SGD (Descenso por Gradiente Estocástico)</option>
                <option value="rmsprop">RMSprop</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tasa de Aprendizaje (&alpha; / lr)</label>
              <input
                type="number"
                step="0.0001"
                value={learningRate}
                disabled={status === 'RUNNING'}
                onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Simulation Speed Buttons */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Velocidad del Worker (Simulador)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                      speed === s
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'border-slate-800 text-slate-500 hover:bg-slate-950'
                    }`}
                  >
                    {s}&times;
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">{activeScenario.architecture.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">{activeScenario.dataset.name}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Progress Bar, Dual Charts & Logs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Bar & Status Pill */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Estado del Job:</span>
                {status === 'PREPARING' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> PREPARING
                  </span>
                )}
                {status === 'RUNNING' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> RUNNING (Época {currentEpoch} / {epochs})
                  </span>
                )}
                {status === 'COMPLETED' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                  </span>
                )}
                {status === 'CANCELLED' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center gap-1.5">
                    <StopCircle className="w-3.5 h-3.5" /> CANCELLED
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-white">{progress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status === 'CANCELLED' ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-400" /> Train Loss
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {latestMetric.loss ? latestMetric.loss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Train Accuracy
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {latestMetric.accuracy ? `${(latestMetric.accuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Val Loss</span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {latestMetric.valLoss ? latestMetric.valLoss.toFixed(4) : '-'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Val Accuracy</span>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                {latestMetric.valAccuracy ? `${(latestMetric.valAccuracy * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>

          {/* Dual Real-Time SVG Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loss Chart */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Curva de Pérdida (Loss)
                </span>
                <span className="text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-bold">— Train</span> vs <span className="text-amber-400 font-bold">--- Val</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                {renderSVGChart('loss')}
              </div>
            </div>

            {/* Accuracy Chart */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Exactitud (Accuracy)
                </span>
                <span className="text-[10px] text-slate-400">
                  <span className="text-indigo-400 font-bold">— Train</span> vs <span className="text-cyan-400 font-bold">--- Val</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                {renderSVGChart('accuracy')}
              </div>
            </div>
          </div>

          {/* Streaming Console / Logs */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Salida de Consola del Worker (Live Telemetry)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Stream WebSocket Activo</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-tight">
                  <span className="text-slate-600 mr-2">&gt;</span>
                  <span className={log.includes('acc:') ? 'text-emerald-400' : 'text-slate-300'}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
