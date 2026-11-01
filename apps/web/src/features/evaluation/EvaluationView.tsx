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
    const h = isLarge ? 260 : 100;
    const pad = isLarge ? 35 : 12;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible select-none">
        <line x1={pad} y1={pad} x2={w - pad} y2={pad} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(255,255,255,0.15)" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="rgba(255,255,255,0.15)" />

        {/* Diagonal Baseline */}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={pad} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" strokeWidth="1" />

        {/* ROC Curve */}
        <path
          d={`M ${pad} ${h - pad} C ${pad + 20} ${pad + 40}, ${pad + 50} ${pad + 10}, ${w - pad} ${pad}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={isLarge ? "2.5" : "2"}
          strokeLinecap="round"
        />

        {isLarge && (
          <>
            <text x={w - pad} y={h - 10} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="monospace">False Positive Rate (1 - Specificity)</text>
            <text x={pad + 10} y={pad + 15} fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="monospace">True Positive Rate (Recall)</text>
          </>
        )}
      </svg>
    );
  };

  const renderMatrixTable = (isLarge = false) => {
    return (
      <table className="w-full text-center text-xs font-mono">
        <thead>
          <tr className="text-white/40 border-b border-white/10">
            <th className="p-2 text-left font-sans font-medium">Etiqueta Real</th>
            <th className="p-2">Pred: 0</th>
            <th className="p-2">Pred: 1</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {matrix.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2.5 text-left font-sans font-medium text-white/80">{row.label}</td>
              <td className={`p-2.5 font-bold ${idx === 0 ? 'bg-white/15 text-white rounded-lg font-mono border border-white/10' : 'text-white/40'}`}>
                {row.pred0}
              </td>
              <td className={`p-2.5 font-bold ${idx === 1 ? 'bg-white/15 text-white rounded-lg font-mono border border-white/10' : 'text-white/40'}`}>
                {row.pred1}
              </td>
              <td className="p-2.5 text-white/40">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
          <LineChart className="w-4 h-4 text-white/80" /> Módulo 07 • Evaluación & Métricas
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white dark:text-white light:text-zinc-900 mt-1">
          Rendimiento & Benchmarks del Modelo
        </h1>
        <p className="text-xs text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">
          Generalización en conjunto de prueba no visto, matriz de confusión y discriminabilidad ROC.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500 font-medium">Test Accuracy</span>
          <div className="text-xl font-bold text-white dark:text-white light:text-zinc-900 font-mono mt-1">{accuracy}%</div>
          <span className="text-[10px] text-white/40">Generalización verificada</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500 font-medium">Test Loss</span>
          <div className="text-xl font-bold text-white dark:text-white light:text-zinc-900 font-mono mt-1">{loss}</div>
          <span className="text-[10px] text-white/40">Función de coste final</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500 font-medium">F1-Score</span>
          <div className="text-xl font-bold text-white dark:text-white light:text-zinc-900 font-mono mt-1">{f1}</div>
          <span className="text-[10px] text-white/40">Media armónica calibrada</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 dark:text-white/50 light:text-zinc-500 font-medium">Área ROC (AUC)</span>
          <div className="text-xl font-bold text-white dark:text-white light:text-zinc-900 font-mono mt-1">0.964</div>
          <span className="text-[10px] text-white/40">Discriminabilidad excelente</span>
        </div>
      </div>

      {/* Main Grid: Left Runs Table (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Experiments Comparison Table & Observations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-white/70" /> Comparativa de Experimentos
              </h2>
              <span className="text-[10px] text-white/40 font-mono">3 ejecuciones registradas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="pb-2.5 font-medium">Experimento</th>
                    <th className="pb-2.5 font-medium">Épocas</th>
                    <th className="pb-2.5 font-medium">Exactitud</th>
                    <th className="pb-2.5 font-medium">Loss</th>
                    <th className="pb-2.5 font-medium">F1</th>
                    <th className="pb-2.5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {experiments.map((exp) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        exp.isBest
                          ? 'bg-white/10 text-white font-semibold'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="py-3 font-sans font-medium text-white/90">
                        {exp.name}
                        {exp.isBest && (
                          <span className="ml-2 text-[9px] px-2 py-0.5 rounded-full glass-inset text-white font-mono border border-white/15">
                            Mejor
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-white/70">{exp.epochs}</td>
                      <td className="py-3 font-semibold text-white">{exp.accuracy}</td>
                      <td className="py-3 text-white/70">{exp.loss}</td>
                      <td className="py-3 text-white/90">{exp.f1Score}</td>
                      <td className="py-3 font-sans">
                        <span className="text-[10px] px-2 py-0.5 rounded-full glass-inset text-white/70 border border-white/10">
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-2 text-xs">
            <span className="font-semibold text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-white/70" /> Observaciones de Gobernanza
            </span>
            <p className="text-white/50 dark:text-white/50 light:text-zinc-500 leading-relaxed">
              El modelo cumple con el criterio de aceptación técnica: F1 &gt; 0.90 y tasa de error menor al 5.0%. Los pesos están listos para certificación en el Registro de Modelos.
            </p>
          </div>
        </div>

        {/* RIGHT DOCK: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-3.5">
          <div className="text-xs font-medium text-white/50 dark:text-white/50 light:text-zinc-500 flex items-center justify-between px-1">
            <span>Visualizaciones (Dock)</span>
            <span className="text-[10px] text-white/70">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Mini Confusion Matrix Preview */}
          <div
            onClick={() => setEnlargedModal('matrix')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-white/70" /> Matriz de Confusión
              </span>
              <Maximize2 className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
            </div>

            <div className="p-2 glass-inset rounded-xl overflow-hidden">
              {renderMatrixTable(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5">
              <span>Test Set (1,000 muestras)</span>
              <span className="text-white/70 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Mini ROC Curve Preview */}
          <div
            onClick={() => setEnlargedModal('roc')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-white/70" /> Curva ROC
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-white/80 font-semibold">AUC 0.964</span>
                <Maximize2 className="w-3 h-3 text-white/40 hover:text-white transition-colors ml-1" />
              </div>
            </div>

            <div className="p-2 glass-inset rounded-xl">
              {renderROCChart(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/40 px-0.5">
              <span>Sensibilidad vs 1 - Especificidad</span>
              <span className="text-white/70 font-medium">Ampliar &rarr;</span>
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
          <div className="p-6 glass-inset rounded-2xl border border-white/10 flex justify-center">
            {enlargedModal === 'matrix' && renderMatrixTable(true)}
            {enlargedModal === 'roc' && renderROCChart(true)}
          </div>

          <div className="p-3.5 rounded-2xl glass-inset border border-white/10 text-xs text-white/60">
            {enlargedModal === 'matrix'
              ? 'Diagonal resaltada refleja clasificaciones correctas (96.3% de aciertos sobre el total de prueba).'
              : 'El área bajo la curva (AUC = 0.964) certifica que el modelo supera con creces el baseline aleatorio (0.50).'}
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
