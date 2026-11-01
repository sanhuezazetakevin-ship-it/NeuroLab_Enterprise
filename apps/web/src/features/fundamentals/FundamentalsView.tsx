import React, { useState } from 'react';
import {
  BookOpen,
  Sliders,
  RotateCcw,
  Network,
  HelpCircle,
  Check,
  Info,
  Maximize2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

export const FundamentalsView: React.FC = () => {
  const { showToast } = useDemo();

  // Interactive artificial neuron state
  const [x1, setX1] = useState(0.8);
  const [x2, setX2] = useState(-0.5);
  const [w1, setW1] = useState(1.4);
  const [w2, setW2] = useState(0.8);
  const [bias, setBias] = useState(-0.2);
  const [activationFn, setActivationFn] = useState<'relu' | 'sigmoid' | 'tanh' | 'leaky_relu'>('relu');

  // Math calculation: z = x1*w1 + x2*w2 + bias
  const z = Number((x1 * w1 + x2 * w2 + bias).toFixed(3));

  // Compute activation
  let activated = 0;
  if (activationFn === 'relu') {
    activated = Math.max(0, z);
  } else if (activationFn === 'sigmoid') {
    activated = 1 / (1 + Math.exp(-z));
  } else if (activationFn === 'tanh') {
    activated = Math.tanh(z);
  } else if (activationFn === 'leaky_relu') {
    activated = z > 0 ? z : 0.1 * z;
  }
  const y = Number(activated.toFixed(3));

  // Modal enlargement state
  const [enlargedModal, setEnlargedModal] = useState<'neuron' | 'activation' | null>(null);

  const resetNeuron = () => {
    setX1(0.8);
    setX2(-0.5);
    setW1(1.4);
    setW2(0.8);
    setBias(-0.2);
    setActivationFn('relu');
    showToast('Parámetros de neurona restablecidos', 'info');
  };

  // Render SVG Activation Curve in Frosted Grey Style
  const renderActivationCurve = (isLarge = false) => {
    const points: string[] = [];
    const minZ = -4;
    const maxZ = 4;
    const width = isLarge ? 640 : 260;
    const height = isLarge ? 240 : 90;
    const padding = isLarge ? 30 : 12;

    for (let currentZ = minZ; currentZ <= maxZ; currentZ += 0.2) {
      let val = 0;
      if (activationFn === 'relu') val = Math.max(0, currentZ);
      else if (activationFn === 'sigmoid') val = 1 / (1 + Math.exp(-currentZ));
      else if (activationFn === 'tanh') val = Math.tanh(currentZ);
      else if (activationFn === 'leaky_relu') val = currentZ > 0 ? currentZ : 0.1 * currentZ;

      const px = padding + ((currentZ - minZ) / (maxZ - minZ)) * (width - 2 * padding);
      let py = height / 2;
      if (activationFn === 'sigmoid') {
        py = (height - padding) - val * (height - 2 * padding);
      } else if (activationFn === 'tanh') {
        py = (height / 2) - val * ((height - 2 * padding) / 2);
      } else {
        py = (height - padding) - (val / 4) * (height - 2 * padding);
      }
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    const clampedZ = Math.max(-4, Math.min(4, z));
    const dotX = padding + ((clampedZ - minZ) / (maxZ - minZ)) * (width - 2 * padding);
    let dotY = height / 2;
    if (activationFn === 'sigmoid') {
      dotY = (height - padding) - y * (height - 2 * padding);
    } else if (activationFn === 'tanh') {
      dotY = (height / 2) - y * ((height - 2 * padding) / 2);
    } else {
      dotY = (height - padding) - (Math.min(4, y) / 4) * (height - 2 * padding);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none text-zinc-900 dark:text-white">
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 3" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 3" />

        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={isLarge ? "2.5" : "2"}
          points={points.join(' ')}
          strokeLinecap="round"
        />

        <circle cx={dotX} cy={dotY} r={isLarge ? "5" : "3.5"} fill="currentColor" stroke="var(--canvas-bg)" strokeWidth="1.5" />
      </svg>
    );
  };

  // Render SVG Neuron Diagram in Frosted Grey Style
  const renderNeuronSVG = (isLarge = false) => {
    const w = isLarge ? 600 : 280;
    const h = isLarge ? 240 : 120;
    const scale = isLarge ? 1.5 : 0.82;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible select-none text-zinc-900 dark:text-white">
        {/* Connections */}
        <line
          x1={40 * scale}
          y1={45 * scale}
          x2={130 * scale}
          y2={85 * scale}
          stroke="currentColor"
          strokeOpacity={w1 >= 0 ? "0.9" : "0.35"}
          strokeWidth={Math.max(1.5, Math.abs(w1) * 2)}
          strokeLinecap="round"
        />
        <line
          x1={40 * scale}
          y1={125 * scale}
          x2={130 * scale}
          y2={85 * scale}
          stroke="currentColor"
          strokeOpacity={w2 >= 0 ? "0.9" : "0.35"}
          strokeWidth={Math.max(1.5, Math.abs(w2) * 2)}
          strokeLinecap="round"
        />
        <line
          x1={130 * scale}
          y1={85 * scale}
          x2={210 * scale}
          y2={85 * scale}
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Input 1 */}
        <circle cx={40 * scale} cy={45 * scale} r={14 * scale} fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <text x={40 * scale} y={48 * scale} fontSize={9 * scale} textAnchor="middle" fill="currentColor" fontWeight="bold">x1</text>

        {/* Input 2 */}
        <circle cx={40 * scale} cy={125 * scale} r={14 * scale} fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <text x={40 * scale} y={128 * scale} fontSize={9 * scale} textAnchor="middle" fill="currentColor" fontWeight="bold">x2</text>

        {/* Sum node */}
        <circle cx={130 * scale} cy={85 * scale} r={20 * scale} fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
        <text x={130 * scale} y={83 * scale} fontSize={9 * scale} textAnchor="middle" fill="currentColor" fontWeight="bold">&sum;+b</text>
        <text x={130 * scale} y={95 * scale} fontSize={8 * scale} textAnchor="middle" fill="currentColor" opacity="0.7" fontFamily="monospace">z={z}</text>

        {/* Activation Node */}
        <rect x={195 * scale} y={67 * scale} width={36 * scale} height={36 * scale} rx={8 * scale} fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
        <text x={213 * scale} y={83 * scale} fontSize={8 * scale} textAnchor="middle" fill="currentColor" opacity="0.8" fontWeight="bold">{activationFn}</text>
        <text x={213 * scale} y={95 * scale} fontSize={9 * scale} textAnchor="middle" fill="currentColor" fontFamily="monospace" fontWeight="bold">y={y}</text>
      </svg>
    );
  };

  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});

  const quizQuestions = [
    {
      id: 1,
      q: '¿Cuál es el rol del término de sesgo (bias b) en la combinación lineal de una neurona?',
      options: [
        'Amplificar linealmente el producto punto de las entradas.',
        'Desplazar la función de activación horizontalmente para controlar el umbral de disparo.',
        'Normalizar la suma vectorial entre cero y uno.'
      ],
      correct: 1,
      explanation: 'El sesgo permite que la neurona dispare una salida no nula incluso cuando el vector de entradas es idéntico a cero.'
    },
    {
      id: 2,
      q: '¿Por qué la función ReLU es el estándar en capas ocultas de redes neuronales profundas?',
      options: [
        'Porque restringe la salida a valores centrados en cero.',
        'Porque mitiga el desvanecimiento del gradiente al tener derivada 1 para z > 0.',
        'Porque es estrictamente convexa en todo el espacio de entrada.'
      ],
      correct: 1,
      explanation: 'La derivada constante de ReLU para entradas positivas preserva la magnitud de los gradientes durante la retropropagación (Backpropagation).'
    }
  ];

  const handleSelectQuiz = (questionId: number, optIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const families = [
    {
      id: 'FEEDFORWARD',
      title: 'Feedforward (MLP)',
      tag: 'Semana 11',
      desc: 'Flujo unidireccional sin ciclos. Adecuada para datos tabulares y clasificación estructurada.',
    },
    {
      id: 'CNN',
      title: 'Convolucional (CNN)',
      tag: 'Visión 2D',
      desc: 'Filtros espaciales que extraen patrones locales preservando invariancia ante traslación.',
    },
    {
      id: 'RNN',
      title: 'Recurrente (LSTM)',
      tag: 'Secuencias',
      desc: 'Células de memoria que retienen contexto a lo largo de pasos de tiempo secuenciales.',
    },
    {
      id: 'GAN',
      title: 'Generativa (GAN)',
      tag: 'Adversaria',
      desc: 'Estructura dual: Generador compite frente a Discriminador en juego minimax.',
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-zinc-800 dark:text-white/80" /> Módulo 03 • Fundamentos Neuronales (Semana 11)
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Matemáticas y Estructura del Perceptrón
          </h1>
          <p className="text-xs text-zinc-600 dark:text-white/50 mt-0.5">
            Operaciones de aprendizaje: entender la neurona artificial, sinapsis, sesgos y funciones de activación no lineales.
          </p>
        </div>

        <button
          onClick={resetNeuron}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-btn-secondary text-xs font-medium self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer Valores
        </button>
      </div>

      {/* Main Grid: Left Primary Controls (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Controls & Academic Quiz */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sliders for Inputs, Weights and Bias */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-600 dark:text-white/70" /> Parámetros Sinápticos (w) y Sesgo (b)
              </span>
              <span className="text-xs font-mono font-medium text-zinc-800 dark:text-white/80">
                y = f( &sum; w_i &middot; x_i + b ) = {y}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-600 dark:text-white/60 mb-1.5">
                  <span>Entrada x1: <strong className="text-zinc-900 dark:text-white">{x1}</strong></span>
                  <span className="font-mono text-zinc-900 dark:text-white font-medium">w1: {w1}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w1}
                  onChange={(e) => setW1(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-600 dark:text-white/60 mb-1.5">
                  <span>Entrada x2: <strong className="text-zinc-900 dark:text-white">{x2}</strong></span>
                  <span className="font-mono text-zinc-900 dark:text-white font-medium">w2: {w2}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w2}
                  onChange={(e) => setW2(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-600 dark:text-white/60 mb-1.5">
                  <span>Sesgo (Bias b):</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-white">{bias}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={bias}
                  onChange={(e) => setBias(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-white/60 mb-1.5">Función de Activación f(z):</label>
                <select
                  value={activationFn}
                  onChange={(e) => setActivationFn(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3 py-1.5"
                >
                  <option value="relu">ReLU: max(0, z)</option>
                  <option value="sigmoid">Sigmoid: 1/(1+e^-z)</option>
                  <option value="tanh">Tanh: tanh(z)</option>
                  <option value="leaky_relu">Leaky ReLU: z o 0.1z</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-zinc-500 dark:text-white/50 flex items-center justify-between">
              <span>Combinación lineal: z = ({x1}&times;{w1}) + ({x2}&times;{w2}) + ({bias}) = <strong className="text-zinc-900 dark:text-white">{z}</strong></span>
              <span>Disparo: y = <strong className="text-zinc-900 dark:text-white">{y}</strong></span>
            </div>
          </div>

          {/* Families Catalog Grid */}
          <div className="grid grid-cols-2 gap-3">
            {families.map((fam) => (
              <div key={fam.id} className="glass-card p-4 rounded-2xl glass-card-hover space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">{fam.title}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full glass-inset text-zinc-700 dark:text-white/70 font-mono">
                    {fam.tag}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-white/50 leading-tight">{fam.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Checkpoint Quiz */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Evaluación Rápida (Checkpoint S11)
            </span>

            {quizQuestions.map((q) => {
              const selected = quizAnswers[q.id];
              const isAnswered = selected !== undefined && selected !== null;
              const isCorrect = selected === q.correct;

              return (
                <div key={q.id} className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-xs space-y-2">
                  <p className="font-medium text-zinc-900 dark:text-white">{q.id}. {q.q}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'border-black/10 dark:border-white/10 text-zinc-700 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/[0.08]';
                      if (isAnswered) {
                        if (optIdx === q.correct) btnStyle = 'border-zinc-900 dark:border-white bg-black/10 dark:bg-white/20 text-zinc-900 dark:text-white font-semibold';
                        else if (optIdx === selected) btnStyle = 'border-red-400/40 bg-red-500/10 text-red-600 dark:text-red-300';
                        else btnStyle = 'opacity-30';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectQuiz(q.id, optIdx)}
                          className={`p-2.5 rounded-xl border text-left text-[11px] transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {isAnswered && (
                    <div className="text-[11px] text-zinc-500 dark:text-white/50 pt-1 border-t border-black/5 dark:border-white/5">
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DOCK: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-3.5">
          <div className="text-xs font-medium text-zinc-600 dark:text-white/50 flex items-center justify-between px-1">
            <span>Visualizaciones (Dock)</span>
            <span className="text-[10px] text-zinc-800 dark:text-white/70">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Perceptron Diagram Preview */}
          <div
            onClick={() => setEnlargedModal('neuron')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                <Network className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Grafo Sináptico
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-zinc-500 dark:text-white/60">z={z}</span>
                <Maximize2 className="w-3 h-3 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors" />
              </div>
            </div>

            <div className="p-2 glass-inset rounded-xl">
              {renderNeuronSVG(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-white/40 px-0.5">
              <span>Perceptrón artificial</span>
              <span className="text-zinc-800 dark:text-white/70 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Activation Curve Preview */}
          <div
            onClick={() => setEnlargedModal('activation')}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Curva f(z): {activationFn}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-zinc-500 dark:text-white/60">y={y}</span>
                <Maximize2 className="w-3 h-3 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors" />
              </div>
            </div>

            <div className="p-2 glass-inset rounded-xl">
              {renderActivationCurve(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-white/40 px-0.5">
              <span>Plano cartesiano [-4, 4]</span>
              <span className="text-zinc-800 dark:text-white/70 font-medium">Ampliar &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED MODAL */}
      <EnlargedChartModal
        isOpen={enlargedModal !== null}
        onClose={() => setEnlargedModal(null)}
        title={enlargedModal === 'neuron' ? 'Esquema Sináptico del Perceptrón (Vista Ampliada)' : `Función de Activación ${activationFn.toUpperCase()} (Detalle Matemático)`}
        subtitle={enlargedModal === 'neuron' ? 'Visualización vectorial de entradas ponderadas x_i * w_i, sesgo b y nodo de activación' : 'Plano cartesiano de alta definición con punto de operación (z, y) en tiempo real'}
        badge="Fundamentos Semana 11"
      >
        <div className="space-y-4">
          <div className="p-6 glass-inset rounded-2xl border border-black/10 dark:border-white/10 flex justify-center">
            {enlargedModal === 'neuron' && renderNeuronSVG(true)}
            {enlargedModal === 'activation' && renderActivationCurve(true)}
          </div>

          <div className="p-3.5 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-xs text-zinc-700 dark:text-white/70">
            Valores activos: Entrada x1={x1}, x2={x2} | Pesos w1={w1}, w2={w2} | Sesgo b={bias} | Suma z={z} | Salida y={y}
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
