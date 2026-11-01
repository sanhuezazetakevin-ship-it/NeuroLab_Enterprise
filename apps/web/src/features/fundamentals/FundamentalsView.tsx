import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Network,
  RotateCcw,
  Zap,
  Info,
  Check,
  X
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

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

  // Reset neuron parameters to baseline
  const resetNeuron = () => {
    setX1(0.8);
    setX2(-0.5);
    setW1(1.4);
    setW2(0.8);
    setBias(-0.2);
    setActivationFn('relu');
    showToast('Parámetros de neurona restablecidos a valores iniciales', 'info');
  };

  // Generate SVG curve points for z in [-4, 4]
  const renderActivationCurve = () => {
    const points: string[] = [];
    const minZ = -4;
    const maxZ = 4;
    const width = 280;
    const height = 140;

    for (let currentZ = minZ; currentZ <= maxZ; currentZ += 0.2) {
      let val = 0;
      if (activationFn === 'relu') val = Math.max(0, currentZ);
      else if (activationFn === 'sigmoid') val = 1 / (1 + Math.exp(-currentZ));
      else if (activationFn === 'tanh') val = Math.tanh(currentZ);
      else if (activationFn === 'leaky_relu') val = currentZ > 0 ? currentZ : 0.1 * currentZ;

      // Coordinate mapping to SVG canvas:
      // z [-4, 4] -> x [20, 260]
      const px = 20 + ((currentZ - minZ) / (maxZ - minZ)) * 240;
      // val range mapping:
      // For Sigmoid: [0, 1] -> y [120, 20]
      // For ReLU / Leaky: [-0.5, 4] -> y [125, 15]
      // For Tanh: [-1, 1] -> y [125, 15]
      let py = 70;
      if (activationFn === 'sigmoid') {
        py = 120 - val * 100;
      } else if (activationFn === 'tanh') {
        py = 70 - val * 50;
      } else {
        py = 115 - (val / 4) * 95;
      }
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    // Current point dot position
    const clampedZ = Math.max(-4, Math.min(4, z));
    const dotX = 20 + ((clampedZ - minZ) / (maxZ - minZ)) * 240;
    let dotY = 70;
    if (activationFn === 'sigmoid') {
      dotY = 120 - y * 100;
    } else if (activationFn === 'tanh') {
      dotY = 70 - y * 50;
    } else {
      dotY = 115 - (Math.min(4, y) / 4) * 95;
    }

    return (
      <svg className="w-full h-36 overflow-visible" viewBox="0 0 280 140">
        {/* Background Grid & Axis */}
        <line x1="20" y1="70" x2="260" y2="70" stroke="#334155" strokeDasharray="3 3" />
        <line x1="140" y1="10" x2="140" y2="130" stroke="#334155" strokeDasharray="3 3" />
        <text x="255" y="65" fill="#64748b" fontSize="9" fontFamily="monospace">z</text>
        <text x="145" y="18" fill="#64748b" fontSize="9" fontFamily="monospace">f(z)</text>

        {/* Function Path */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          points={points.join(' ')}
          strokeLinecap="round"
        />

        {/* Current Point Dot */}
        <circle cx={dotX} cy={dotY} r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
      </svg>
    );
  };

  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});

  const quizQuestions = [
    {
      id: 1,
      q: '¿Cuál es la función del término de sesgo (bias b) en la neurona artificial?',
      options: [
        'Multiplicar las entradas para amplificar la señal.',
        'Desplazar horizontalmente la función de activación para controlar el umbral de disparo.',
        'Asegurar que todas las salidas sean positivas exclusivamente.'
      ],
      correct: 1,
      explanation: 'El sesgo actúa como un término independiente que permite a la neurona disparar incluso si todas las entradas x_i son cero.'
    },
    {
      id: 2,
      q: '¿Por qué la función ReLU es la más utilizada en capas ocultas de redes profundas?',
      options: [
        'Porque normaliza las salidas estrictamente entre 0 y 1.',
        'Porque mitiga el problema del desvanecimiento del gradiente y su cómputo es max(0, z).',
        'Porque genera salidas centradas en cero.'
      ],
      correct: 1,
      explanation: 'ReLU tiene derivada constante igual a 1 para z > 0, evitando que los gradientes se desvanezcan al retropropagarse por muchas capas.'
    },
    {
      id: 3,
      q: '¿Qué familia de red neuronal es la más adecuada para secuencias y series temporales?',
      options: [
        'Redes Convolucionales (CNN) sin memoria.',
        'Redes Generativas Adversarias (GAN).',
        'Redes Recurrentes (RNN, LSTM, GRU) con bucles temporales.'
      ],
      correct: 2,
      explanation: 'Las RNN mantienen un vector de estado interno que transmite memoria a través de los pasos de tiempo de la secuencia.'
    }
  ];

  const handleSelectQuiz = (questionId: number, optIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const families = [
    {
      id: 'FEEDFORWARD',
      title: 'Feedforward (FNN / Multilayer Perceptron)',
      tag: 'Operación Semana 11',
      desc: 'El flujo de señales es estrictamente unidireccional, sin ciclos de realimentación. Diseñada para clasificación tabular, regresión y scoring.',
      layers: 'Dense, Dropout, BatchNormalization',
      useCase: 'Detección de fraude, predicción de fuga (churn), riesgo crediticio.'
    },
    {
      id: 'RNN',
      title: 'Recurrentes (RNN, LSTM, GRU)',
      tag: 'Secuencias Temporales',
      desc: 'Poseen conexiones de realimentación y memoria interna. Extraen dependencias contextuales y de orden en el tiempo.',
      layers: 'SimpleRNN, LSTM, GRU, Dense',
      useCase: 'Pronóstico de demanda, análisis de texto (NLP), señales biomédicas.'
    },
    {
      id: 'CNN',
      title: 'Convolucionales (CNN)',
      tag: 'Visión Artificial',
      desc: 'Implementan filtros matriciales (kernels) que preservan la relación espacial 2D de píxeles, detectando patrones invariantes a traslación.',
      layers: 'Conv2D, MaxPooling2D, Flatten, Dense',
      useCase: 'Inspección de defectos, radiología, reconocimiento facial.'
    },
    {
      id: 'GAN',
      title: 'Generativas Adversarias (GAN)',
      tag: 'Generación Sintética',
      desc: 'Dos redes (Generador y Discriminador) entrenadas simultáneamente en un juego minimax de teoría de juegos.',
      layers: 'Generator Subnetwork vs. Discriminator',
      useCase: 'Aumento de datos escasos, síntesis de voz, super-resolución de imágenes.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Módulo 03 • Fundamentos Neuronales (Semana 11)
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Arquitectura y Matemáticas de la Red Neuronal
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Simulador interactivo de la neurona artificial (Perceptrón), exploración de funciones de activación no lineales y catálogo comparativo de familias.
          </p>
        </div>

        <button
          onClick={resetNeuron}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer Simulador
        </button>
      </div>

      {/* INTERACTIVE NEURON SIMULATOR */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Simulador Visual del Perceptrón Artificial
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-950 text-emerald-300 border border-slate-800 font-bold">
            y = f( &sum; w_i &middot; x_i + b )
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Controls: Inputs and Weights */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Sinapsis y Pesos</span>
              <span className="text-[10px] text-emerald-400 font-normal">Ajusta en tiempo real</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Entrada x1: <strong className="text-white font-mono">{x1}</strong></span>
                <span className="text-emerald-400 font-mono font-bold">Peso w1: {w1}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={w1}
                onChange={(e) => setW1(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Entrada x2: <strong className="text-white font-mono">{x2}</strong></span>
                <span className="text-emerald-400 font-mono font-bold">Peso w2: {w2}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="text-indigo-400 font-semibold">Sesgo / Bias (b):</span>
                <span className="text-indigo-300 font-mono font-bold">{bias}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={bias}
                onChange={(e) => setBias(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic SVG Visual Neural Diagram */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 self-start">
              2. Grafo Sináptico Dinámico
            </h3>

            <svg viewBox="0 0 320 180" className="w-full h-44">
              {/* Synapse Lines with thickness proportional to absolute weight */}
              {/* x1 to Sum */}
              <line
                x1="60"
                y1="50"
                x2="160"
                y2="90"
                stroke={w1 >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={Math.max(1.5, Math.abs(w1) * 3)}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
              {/* x2 to Sum */}
              <line
                x1="60"
                y1="130"
                x2="160"
                y2="90"
                stroke={w2 >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth={Math.max(1.5, Math.abs(w2) * 3)}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
              {/* Sum to Activation */}
              <line
                x1="160"
                y1="90"
                x2="250"
                y2="90"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray="4 4"
              />

              {/* Input Node 1 */}
              <circle cx="60" cy="50" r="18" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <text x="60" y="47" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">x1</text>
              <text x="60" y="58" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">{x1}</text>

              {/* Weight 1 Label */}
              <rect x="90" y="50" width="36" height="15" rx="3" fill="#0f172a" stroke="#334155" />
              <text x="108" y="61" fill={w1 >= 0 ? '#34d399' : '#f87171'} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                w1:{w1}
              </text>

              {/* Input Node 2 */}
              <circle cx="60" cy="130" r="18" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <text x="60" y="127" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">x2</text>
              <text x="60" y="138" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">{x2}</text>

              {/* Weight 2 Label */}
              <rect x="90" y="115" width="36" height="15" rx="3" fill="#0f172a" stroke="#334155" />
              <text x="108" y="126" fill={w2 >= 0 ? '#34d399' : '#f87171'} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                w2:{w2}
              </text>

              {/* Summing Node (Soma) */}
              <circle cx="160" cy="90" r="26" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
              <text x="160" y="84" fill="#a7f3d0" fontSize="9" textAnchor="middle" fontWeight="bold">&sum; + b</text>
              <text x="160" y="99" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">z={z}</text>

              {/* Activation Node */}
              <rect x="230" y="68" width="45" height="44" rx="8" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
              <text x="252" y="85" fill="#c7d2fe" fontSize="8" textAnchor="middle" fontWeight="bold" className="uppercase">
                {activationFn}
              </text>
              <text x="252" y="100" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                y={y}
              </text>
            </svg>

            <p className="text-[11px] text-slate-400 text-center mt-2">
              Suma ponderada: <span className="font-mono text-white">({x1}&times;{w1}) + ({x2}&times;{w2}) + ({bias}) = </span>
              <span className="font-mono text-emerald-400 font-bold">{z}</span> &rarr; Disparo <span className="font-mono text-indigo-300 font-bold">{y}</span>.
            </p>
          </div>

          {/* Mathematical Activation Curve Visualizer */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              3. Curva de Activación f(z)
            </h3>

            {/* SVG Plot */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              {renderActivationCurve()}
            </div>

            {/* Activation Function Selector */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'relu', label: 'ReLU', desc: 'max(0, z)' },
                { id: 'sigmoid', label: 'Sigmoid', desc: '1/(1+e^-z)' },
                { id: 'tanh', label: 'Tanh', desc: 'tanh(z)' },
                { id: 'leaky_relu', label: 'Leaky ReLU', desc: 'z o 0.1z' },
              ].map((fn) => (
                <button
                  key={fn.id}
                  onClick={() => setActivationFn(fn.id as any)}
                  className={`p-2 rounded-lg text-left border text-xs transition-colors ${
                    activationFn === fn.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="text-[11px]">{fn.label}</div>
                  <div className="text-[9px] text-slate-500 font-mono">{fn.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAMILIES CATALOG */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" /> Clasificación de Familias de Redes Neuronales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map((fam) => (
            <div key={fam.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    {fam.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-semibold">
                    {fam.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{fam.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{fam.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Capas admitidas:</strong> <code className="text-emerald-400">{fam.layers}</code>
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">Casos empresariales:</strong> {fam.useCase}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE KNOWLEDGE CHECKPOINT / QUIZ */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Evaluación Conceptual Rápida (Checkpoint Semana 11)
            </h2>
          </div>
          <span className="text-xs text-slate-400">3 preguntas interactivas</span>
        </div>

        <div className="space-y-4">
          {quizQuestions.map((q) => {
            const selected = quizAnswers[q.id];
            const isAnswered = selected !== undefined && selected !== null;
            const isCorrect = selected === q.correct;

            return (
              <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <p className="text-xs font-bold text-white">{q.id}. {q.q}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    let btnStyle = 'border-slate-800 text-slate-300 hover:bg-slate-900';
                    if (isAnswered) {
                      if (optIdx === q.correct) {
                        btnStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-semibold';
                      } else if (optIdx === selected) {
                        btnStyle = 'border-red-500/60 bg-red-500/15 text-red-300';
                      } else {
                        btnStyle = 'border-slate-800 text-slate-600 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectQuiz(q.id, optIdx)}
                        className={`p-2.5 rounded-lg border text-xs text-left transition-colors flex items-start gap-2 ${btnStyle}`}
                      >
                        <span className="font-mono text-[10px] text-slate-500">{String.fromCharCode(65 + optIdx)})</span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                    {isCorrect ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Info className="w-4 h-4 text-amber-400 shrink-0" />}
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
