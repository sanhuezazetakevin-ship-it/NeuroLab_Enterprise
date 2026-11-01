import React, { useState } from 'react';
import {
  LineChart,
  CheckCircle2,
  Target,
  Award,
  Zap,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

export const EvaluationView: React.FC = () => {
  const { activeScenario, showToast } = useDemo();

  const [activeTab, setActiveTab] = useState<'matrix' | 'roc' | 'runs'>('matrix');

  const accuracy = (activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1);
  const loss = activeScenario.modelVersion.metricsSummary.loss.toFixed(3);
  const f1 = activeScenario.modelVersion.metricsSummary.f1Score
    ? activeScenario.modelVersion.metricsSummary.f1Score.toFixed(3)
    : '0.941';

  // Scenario-specific confusion matrix
  let matrix = [
    { label: 'Real: 0 (Normal / No Fraude)', pred0: 485, pred1: 15, total: 500 },
    { label: 'Real: 1 (Positivo / Fraude)', pred0: 22, pred1: 478, total: 500 },
  ];

  if (activeScenario.id === 'salud') {
    matrix = [
      { label: 'Real: Normal', pred0: 420, pred1: 12, total: 432 },
      { label: 'Real: Neumonía', pred0: 18, pred1: 550, total: 568 },
    ];
  }

  const experiments = [
    {
      id: 'EXP-01',
      name: `${activeScenario.architecture.name} (Seleccionado)`,
      epochs: 25,
      batchSize: 64,
      accuracy: `${accuracy}%`,
      loss: loss,
      f1Score: f1,
      status: 'PRODUCCIÓN',
      isBest: true,
    },
    {
      id: 'EXP-02',
      name: 'Baseline Red Feedforward Simple',
      epochs: 15,
      batchSize: 32,
      accuracy: '88.4%',
      loss: '0.285',
      f1Score: '0.871',
      status: 'ARCHIVADO',
      isBest: false,
    },
    {
      id: 'EXP-03',
      name: 'Variante con Optimizador SGD + Momentum',
      epochs: 30,
      batchSize: 128,
      accuracy: '86.1%',
      loss: '0.340',
      f1Score: '0.849',
      status: 'ARCHIVADO',
      isBest: false,
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <LineChart className="w-4 h-4" /> Módulo 07 • Evaluación & Métricas
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Evaluación de Rendimiento & Benchmarks</h1>
        <p className="text-xs text-slate-300 mt-1">
          Análisis de generalización en test set independiente, matrices de confusión, curvas ROC y auditoría de límites.
        </p>
      </div>

      {/* Metrics Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Exactitud en Test Set</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{accuracy}%</div>
          <span className="text-[10px] text-slate-500">Muestras no vistas durante entrenamiento</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Test Loss (Pérdida)</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{loss}</div>
          <span className="text-[10px] text-slate-500">Crossentropy / Función de coste</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">F1-Score Calibrado</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{f1}</div>
          <span className="text-[10px] text-slate-500">Balance entre Precisión y Sensibilidad</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Área Bajo la Curva (ROC-AUC)</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">0.964</div>
          <span className="text-[10px] text-slate-500">Discriminabilidad excelente (&gt; 0.90)</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'matrix'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Matriz de Confusión
        </button>
        <button
          onClick={() => setActiveTab('roc')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'roc'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Curva ROC & Calibración
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'runs'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Comparativa de Experimentos
        </button>
      </div>

      {/* Tab 1: Confusion Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Matriz de Confusión (Test Set)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="p-2.5 text-left font-sans">Etiqueta Real</th>
                    <th className="p-2.5">Pred: Clase 0</th>
                    <th className="p-2.5">Pred: Clase 1</th>
                    <th className="p-2.5">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matrix.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-left font-sans font-medium text-slate-300">{row.label}</td>
                      <td className={`p-3 font-bold ${idx === 0 ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 rounded' : 'text-slate-400'}`}>
                        {row.pred0}
                      </td>
                      <td className={`p-3 font-bold ${idx === 1 ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 rounded' : 'text-slate-400'}`}>
                        {row.pred1}
                      </td>
                      <td className="p-3 text-slate-500">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Interpretación Estadística:
              </div>
              <p>
                La diagonal principal en verde corresponde a clasificaciones correctas (Verdaderos Negativos y Verdaderos Positivos). La tasa de error es inferior al 4.2%.
              </p>
            </div>
          </div>

          {/* Observations and Limitations */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" /> Registro de Limitaciones & Observaciones
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-200 font-semibold">Sensibilidad ante Datos Fuera de Distribución (OOD):</span>
                <p className="text-slate-400">
                  El modelo fue calibrado en transacciones/imágenes con características estandarizadas. Se recomienda monitorear con data drift detector en producción.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-200 font-semibold">Latencia Promedio de Inferencia:</span>
                <p className="text-slate-400">
                  <code className="text-emerald-400">1.8 ms</code> por transacción en CPU; adecuado para validación síncrona en pasarelas de pago.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-200 font-semibold">Regla de Aprobación de Modelo (Sec. 10):</span>
                <p className="text-slate-400">
                  Cumple con el criterio de aceptación: Accuracy &gt; 92.0% y False Negative Rate &lt; 5.0%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ROC Curve */}
      {activeTab === 'roc' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Curva ROC (Receiver Operating Characteristic)
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              AUC = 0.964
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
            <svg viewBox="0 0 400 240" className="w-full max-w-lg h-56">
              {/* Background grid */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="380" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="200" x2="380" y2="200" stroke="#334155" />
              <line x1="40" y1="20" x2="40" y2="200" stroke="#334155" />

              {/* Random Guess Diagonal */}
              <line x1="40" y1="200" x2="380" y2="20" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />

              {/* ROC Curve for Model (AUC = 0.964) */}
              <path
                d="M 40 200 C 60 80, 110 30, 380 20"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Labels */}
              <text x="375" y="215" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">FPR (1 - Specificity)</text>
              <text x="45" y="32" fill="#64748b" fontSize="10" fontFamily="monospace">TPR (Recall)</text>
            </svg>
          </div>
          <p className="text-xs text-slate-400 text-center">
            La curva en verde muestra una tasa elevada de verdaderos positivos (TPR) con una tasa insignificante de falsos positivos (FPR).
          </p>
        </div>
      )}

      {/* Tab 3: Experiments Comparison */}
      {activeTab === 'runs' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Tabla Comparativa de Ejecuciones (Runs)
            </h2>
            <span className="text-xs text-slate-400">Total: 3 corridas registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Experimento</th>
                  <th className="pb-2.5 font-medium">Épocas</th>
                  <th className="pb-2.5 font-medium">Batch</th>
                  <th className="pb-2.5 font-medium">Exactitud (Test)</th>
                  <th className="pb-2.5 font-medium">Pérdida</th>
                  <th className="pb-2.5 font-medium">F1-Score</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {experiments.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      exp.isBest ? 'bg-emerald-500/10 hover:bg-emerald-500/15' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 font-sans font-bold text-slate-200">
                      {exp.name}
                      {exp.isBest && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                          Mejor Modelo
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-300">{exp.epochs}</td>
                    <td className="py-3 text-slate-300">{exp.batchSize}</td>
                    <td className="py-3 font-bold text-emerald-400">{exp.accuracy}</td>
                    <td className="py-3 text-slate-300">{exp.loss}</td>
                    <td className="py-3 text-indigo-300">{exp.f1Score}</td>
                    <td className="py-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
