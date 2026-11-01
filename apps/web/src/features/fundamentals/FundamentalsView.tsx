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

  // Render SVG Activation Curve
  const renderActivationCurve = (isLarge = false) => {
    const points: string[] = [];
    const minZ = -4;
    const maxZ = 4;
    const width = isLarge ? 640 : 260;
    const height = isLarge ? 240 : 100;
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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#94a3b8" strokeDasharray="3 3" className="dark:stroke-slate-700" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#94a3b8" strokeDasharray="3 3" className="dark:stroke-slate-700" />

        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth={isLarge ? "3" : "2"}
          points={points.join(' ')}
          strokeLinecap="round"
        />

        <circle cx={dotX} cy={dotY} r={isLarge ? "5.5" : "3.5"} fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    );
  };

  // Render SVG Neuron Diagram
  const renderNeuronSVG = (isLarge = false) => {
    const w = isLarge ? 600 : 280;
    const h = isLarge ? 260 : 130;
    const scale = isLarge ? 1.6 : 0.85;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible select-none">
        {/* Connections */}
        <line
          x1={40 * scale}
          y1={45 * scale}
          x2={130 * scale}
          y2={85 * scale}
          stroke={w1 >= 0 ? '#2563eb' : '#dc2626'}
          strokeWidth={Math.max(1.5, Math.abs(w1) * 2.5)}
          strokeLinecap="round"
        />
        <line
          x1={40 * scale}
          y1={125 * scale}
          x2={130 * scale}
          y2={85 * scale}
          stroke={w2 >= 0 ? '#2563eb' : '#dc2626'}
          strokeWidth={Math.max(1.5, Math.abs(w2) * 2.5)}
          strokeLinecap="round"
        />
        <line
          x1={130 * scale}
          y1={85 * scale}
          x2={210 * scale}
          y2={85 * scale}
          stroke="#64748b"
          strokeWidth="2"
          strokeDasharray="3 3"
        />

        {/* Input 1 */}
        <circle cx={40 * scale} cy={45 * scale} r={14 * scale} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-700" />
        <text x={40 * scale} y={48 * scale} fontSize={9 * scale} textAnchor="middle" fill="#334155" className="dark:fill-slate-200" fontWeight="bold">x1</text>

        {/* Input 2 */}
        <circle cx={40 * scale} cy={125 * scale} r={14 * scale} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-700" />
        <text x={40 * scale} y={128 * scale} fontSize={9 * scale} textAnchor="middle" fill="#334155" className="dark:fill-slate-200" fontWeight="bold">x2</text>

        {/* Sum node */}
        <circle cx={130 * scale} cy={85 * scale} r={20 * scale} fill="#eff6ff" stroke="#2563eb" strokeWidth="2" className="dark:fill-blue-950/40 dark:stroke-blue-500" />
        <text x={130 * scale} y={83 * scale} fontSize={9 * scale} textAnchor="middle" fill="#1e40af" className="dark:fill-blue-300" fontWeight="bold">&sum;+b</text>
        <text x={130 * scale} y={95 * scale} fontSize={8 * scale} textAnchor="middle" fill="#2563eb" className="dark:fill-blue-400" fontFamily="monospace">z={z}</text>

        {/* Activation Node */}
        <rect x={195 * scale} y={67 * scale} width={36 * scale} height={36 * scale} rx={6 * scale} fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-700" />
        <text x={213 * scale} y={83 * scale} fontSize={8 * scale} textAnchor="middle" fill="#475569" className="dark:fill-slate-300" fontWeight="bold">{activationFn}</text>
        <text x={213 * scale} y={95 * scale} fontSize={9 * scale} textAnchor="middle" fill="#2563eb" className="dark:fill-blue-400" fontFamily="monospace" fontWeight="bold">y={y}</text>
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
      desc: 'Flujo unidireccional sin ciclos de realimentación. Especialmente adecuada para datos tabulares estructurados.',
      layers: 'Dense, Dropout, BatchNormalization',
    },
    {
      id: 'CNN',
      title: 'Convolucional (CNN)',
      tag: 'Visión 2D',
      desc: 'Filtros espaciales que extraen patrones locales preservando invariancia ante traslación.',
      layers: 'Conv2D, MaxPooling2D, Flatten, Dense',
    },
    {
      id: 'RNN',
      title: 'Recurrente (LSTM / GRU)',
      tag: 'Secuencias',
      desc: 'Células de memoria que retienen contexto a lo largo de pasos de tiempo secuenciales.',
      layers: 'SimpleRNN, LSTM, GRU, Dense',
    },
    {
      id: 'GAN',
      title: 'Generativa (GAN)',
      tag: 'Adversaria',
      desc: 'Estructura dual: un Generador compite frente a un Discriminador en un juego minimax.',
      layers: 'Generator Subnetwork vs Discriminator',
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Módulo 03 • Fundamentos Neuronales (Semana 11)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Matemáticas y Estructura del Perceptrón
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operaciones de aprendizaje: entender la neurona artificial, sinapsis, sesgos y funciones de activación no lineales.
          </p>
        </div>

        <button
          onClick={resetNeuron}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer Valores
        </button>
      </div>

      {/* Main Grid: Left Primary Controls (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Controls & Academic Quiz */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sliders for Inputs, Weights and Bias */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Parámetros Sinápticos (w) y Sesgo (b)
              </span>
              <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                y = f( &sum; w_i &middot; x_i + b ) = {y}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Entrada x1: <strong>{x1}</strong></span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">w1: {w1}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w1}
                  onChange={(e) => setW1(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Entrada x2: <strong>{x2}</strong></span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">w2: {w2}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={w2}
                  onChange={(e) => setW2(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Sesgo (Bias b):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{bias}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={bias}
                  onChange={(e) => setBias(parseFloat(e.target.value))}
                  className="w-full accent-slate-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Función de Activación f(z):</label>
                <select
                  value={activationFn}
                  onChange={(e) => setActivationFn(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-slate-800 dark:text-white"
                >
                  <option value="relu">ReLU: max(0, z)</option>
                  <option value="sigmoid">Sigmoid: 1/(1+e^-z)</option>
                  <option value="tanh">Tanh: tanh(z)</option>
                  <option value="leaky_relu">Leaky ReLU: z o 0.1z</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Combinación lineal: z = ({x1}&times;{w1}) + ({x2}&times;{w2}) + ({bias}) = <strong>{z}</strong></span>
              <span>Disparo: y = <strong>{y}</strong></span>
            </div>
          </div>

          {/* Families Catalog Grid */}
          <div className="grid grid-cols-2 gap-3">
            {families.map((fam) => (
              <div key={fam.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{fam.title}</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {fam.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{fam.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Checkpoint Quiz */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Evaluación Rápida (Checkpoint S11)
            </span>

            {quizQuestions.map((q) => {
              const selected = quizAnswers[q.id];
              const isAnswered = selected !== undefined && selected !== null;
              const isCorrect = selected === q.correct;

              return (
                <div key={q.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{q.id}. {q.q}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900';
                      if (isAnswered) {
                        if (optIdx === q.correct) btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold';
                        else if (optIdx === selected) btnStyle = 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
                        else btnStyle = 'opacity-40';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectQuiz(q.id, optIdx)}
                          className={`p-2 rounded border text-left text-[11px] transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {isAnswered && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DOCK: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>Visualizaciones (Miniaturas)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Clic para ampliar</span>
          </div>

          {/* Compact Card 1: Perceptron Diagram Preview */}
          <div
            onClick={() => setEnlargedModal('neuron')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Grafo Sináptico
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-slate-500">z={z}</span>
                <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-1" />
              </div>
            </div>

            <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              {renderNeuronSVG(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Perceptrón artificial 2 entradas</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
            </div>
          </div>

          {/* Compact Card 2: Activation Curve Preview */}
          <div
            onClick={() => setEnlargedModal('activation')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Curva f(z): {activationFn}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-slate-500">y={y}</span>
                <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-1" />
              </div>
            </div>

            <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80">
              {renderActivationCurve(false)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Plano cartesiano [-4, 4]</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Ampliar &rarr;</span>
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
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center">
            {enlargedModal === 'neuron' && renderNeuronSVG(true)}
            {enlargedModal === 'activation' && renderActivationCurve(true)}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Valores activos: Entrada x1={x1}, x2={x2} | Pesos w1={w1}, w2={w2} | Sesgo b={bias} | Suma z={z} | Salida y={y}
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
