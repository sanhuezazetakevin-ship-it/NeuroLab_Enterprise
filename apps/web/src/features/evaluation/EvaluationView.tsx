import React, { useState } from 'react';
import {
  LineChart,
  Target,
  Award,
  Activity,
  Maximize2,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const EvaluationView: React.FC = () => {
  const { activeScenario } = useDemo();

  const [enlargedModal, setEnlargedModal] = useState<'matrix' | 'roc' | null>(null);

  const accuracy = (activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1);
  const loss = activeScenario.modelVersion.metricsSummary.loss.toFixed(3);
  const f1 = activeScenario.modelVersion.metricsSummary.f1Score
    ? activeScenario.modelVersion.metricsSummary.f1Score.toFixed(3)
    : '0.941';

  let matrix = [
    { label: 'Real: 0 (Normal / Negativo)', pred0: 485, pred1: 15, total: 500 },
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
      name: 'Variante con Optimizador SGD',
      epochs: 30,
      batchSize: 128,
      accuracy: '86.1%',
      loss: '0.340',
      f1Score: '0.849',
      status: 'ARCHIVADO',
      isBest: false,
    }
  ];

  const renderROCChart = (isLarge = false) => {
    const w = isLarge ? 640 : 260;
    const h = isLarge ? 280 : 110;
    const pad = isLarge ? 35 : 12;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible select-none">
        <line x1={pad} y1={pad} x2={w - pad} y2={pad} stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#94a3b8" className="dark:stroke-slate-700" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#94a3b8" className="dark:stroke-slate-700" />

        {/* Diagonal Guess */}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={pad} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" className="dark:stroke-slate-700" />

        {/* ROC Curve */}
        <path
          d={`M ${pad} ${h - pad} C ${pad + 20} ${pad + 50}, ${pad + 60} ${pad + 10}, ${w - pad} ${pad}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth={isLarge ? "3" : "2"}
          strokeLinecap="round"
        />

        {isLarge && (
          <>
            <text x={w - pad} y={h - 10} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">False Positive Rate (1 - Specificity)</text>
            <text x={pad + 10} y={pad + 15} fontSize="10" fill="#64748b" fontFamily="monospace">True Positive Rate (Recall)</text>
          </>
        )}
      </svg>
    );
  };

  const renderMatrixTable = (isLarge = false) => {
    return (
      <table className="w-full text-center text-xs font-mono">
        <thead>
          <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
            <th className="p-2 text-left font-sans font-semibold">Etiqueta Real</th>
            <th className="p-2">Pred: 0</th>
            <th className="p-2">Pred: 1</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {matrix.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2.5 text-left font-sans font-medium text-slate-700 dark:text-slate-300">{row.label}</td>
              <td className={`p-2.5 font-bold ${idx === 0 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded font-mono' : 'text-slate-500'}`}>
                {row.pred0}
              </td>
              <td className={`p-2.5 font-bold ${idx === 1 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded font-mono' : 'text-slate-500'}`}>
                {row.pred1}
              </td>
              <td className="p-2.5 text-slate-400">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <LineChart className="w-4 h-4" /> Módulo 07 • Evaluación & Métricas
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Rendimiento & Benchmarks del Modelo
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generalización en conjunto de prueba no visto, matriz de confusión y discriminabilidad ROC.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Test Accuracy</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{accuracy}%</div>
          <span className="text-[10px] text-slate-400">Generalización verificada</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Test Loss</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{loss}</div>
          <span className="text-[10px] text-slate-400">Función de coste final</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">F1-Score</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">{f1}</div>
          <span className="text-[10px] text-slate-400">Media armónica calibrada</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Área ROC (AUC)</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">0.964</div>
          <span className="text-[10px] text-slate-400">Discriminabilidad excelente</span>
        </div>
      </div>

      {/* Main Grid: Left Runs Table (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Experiments Comparison Table & Observations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Comparativa de Experimentos
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">3 ejecuciones registradas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="pb-2 font-semibold">Experimento</th>
                    <th className="pb-2 font-semibold">Épocas</th>
                    <th className="pb-2 font-semibold">Exactitud</th>
                    <th className="pb-2 font-semibold">Loss</th>
                    <th className="pb-2 font-semibold">F1</th>
                    <th className="pb-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {experiments.map((exp) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        exp.isBest
                          ? 'bg-blue-50/60 dark:bg-blue-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 font-sans font-bold text-slate-800 dark:text-slate-200">
                        {exp.name}
                        {exp.isBest && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                            Mejor
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{exp.epochs}</td>
                      <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">{exp.accuracy}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{exp.loss}</td>
                      <td className="py-2.5 text-blue-600 dark:text-blue-400">{exp.f1Score}</td>
                      <td className="py-2.5 font-sans">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Observaciones de Gobernanza
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              El modelo cumple con el criterio de aceptación técnica: F1 &gt; 0.90 y tasa de error menor al 5.0%. Los pesos están listos para certificación en el Registro de Modelos.
            </p>
          </div>
        </div>

        {/* RIGHT DOCK: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>Visualizaciones (Miniaturas)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Mini Confusion Matrix Preview */}
          <div
            onClick={() => setEnlargedModal('matrix')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Matriz de Confusión
              </span>
              <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>

            <div className="p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80 overflow-hidden">
              {renderMatrixTable(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Test Set (1,000 muestras)</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Mini ROC Curve Preview */}
          <div
            onClick={() => setEnlargedModal('roc')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Curva ROC
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">AUC 0.964</span>
                <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-1" />
              </div>
            </div>

            <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              {renderROCChart(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Sensibilidad vs 1 - Especificidad</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED MODAL */}
      <EnlargedChartModal
        isOpen={enlargedModal !== null}
        onClose={() => setEnlargedModal(null)}
        title={enlargedModal === 'matrix' ? 'Matriz de Confusión Detallada (Test Set)' : 'Curva ROC & Análisis de Discriminabilidad'}
        subtitle={enlargedModal === 'matrix' ? 'Conteo de verdaderos positivos, verdaderos negativos, falsos positivos y falsos negativos' : 'Tasa de verdaderos positivos frente a falsos positivos con AUC = 0.964'}
        badge="Evaluación Final"
      >
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center">
            {enlargedModal === 'matrix' && renderMatrixTable(true)}
            {enlargedModal === 'roc' && renderROCChart(true)}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            {enlargedModal === 'matrix'
              ? 'Diagonal resaltada en azul refleja clasificaciones correctas (96.3% de aciertos sobre el total de prueba).'
              : 'El área bajo la curva (AUC = 0.964) certifica que el modelo supera con creces el baseline aleatorio (0.50).'}
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
