import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Cpu,
  PlayCircle,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

interface WalkthroughModalProps {
  onNavigateTab: (tab: any) => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ onNavigateTab }) => {
  const { walkthroughOpen, setWalkthroughOpen } = useDemo();
  const [currentStep, setCurrentStep] = useState(0);

  if (!walkthroughOpen) return null;

  const steps = [
    {
      title: 'NeuroLab Enterprise',
      subtitle: 'Plataforma para el diseño, validación y entrenamiento de Redes Neuronales',
      icon: Layers,
      badge: 'Semana 11',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Plataforma enterprise para las operaciones de la <strong>Semana 11 (Machine Learning & Deep Learning)</strong>.
          </p>
          <div className="p-3.5 rounded-2xl glass-inset space-y-1.5 border border-black/10 dark:border-white/10">
            <span className="text-[11px] font-semibold text-zinc-900 dark:text-white/90 uppercase tracking-wider">Principios Arquitectónicos</span>
            <ul className="space-y-1 list-disc list-inside text-zinc-600 dark:text-white/60">
              <li><strong>Desacoplamiento:</strong> Entrenamientos en workers asíncronos independientes.</li>
              <li><strong>Trazabilidad:</strong> Modelos inmutables con hashes SHA-256 certificados.</li>
              <li><strong>Validación en Servidor:</strong> La API FastAPI valida la coherencia dimensional de capas.</li>
            </ul>
          </div>
        </div>
      ),
      actionLabel: 'Iniciar Recorrido',
      actionTab: null
    },
    {
      title: '1. Fundamentos Neuronales (S11)',
      subtitle: 'Neuronas, sinapsis, pesos, sesgos y funciones de activación',
      icon: BookOpen,
      badge: 'Módulo 03',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            El módulo de <strong>Fundamentos</strong> cuenta con un simulador interactivo del Perceptrón en el lateral derecho con gráficos vectoriales que se pueden ampliar al hacer clic.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            Ajusta los pesos sinápticos (<code className="font-mono">w1, w2</code>) y el sesgo (<code className="font-mono">bias</code>) para ver en tiempo real el cálculo del potencial de disparo.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Fundamentos',
      actionTab: 'fundamentals'
    },
    {
      title: '2. Diseñador de Arquitecturas',
      subtitle: 'Comprobación matemática de tensores y familias de redes',
      icon: Cpu,
      badge: 'Módulo 04',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Configura capas para familias <strong>Feedforward (FNN)</strong>, <strong>Convolucionales (CNN)</strong>, <strong>Recurrentes (RNN/LSTM)</strong> y <strong>Generativas (GAN)</strong>.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            El botón "Guardar y Validar" verifica las dimensiones y parámetros entrenables en la API antes de permitir el entrenamiento.
          </div>
        </div>
      ),
      actionLabel: 'Ir al Diseñador',
      actionTab: 'architectures'
    },
    {
      title: '3. Orquestador de Entrenamientos',
      subtitle: 'Workers TensorFlow/Keras y telemetría por época',
      icon: PlayCircle,
      badge: 'Módulo 06',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Lanza un entrenamiento asíncrono y observa en el panel lateral las curvas de <strong>Pérdida (Loss)</strong> y <strong>Exactitud (Accuracy)</strong>. Haz clic en cualquier gráfico para verlo a pantalla completa.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            Cuenta con simulación de velocidad y botón de cancelación cooperativa.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Entrenamientos',
      actionTab: 'training'
    },
    {
      title: '4. Registro de Modelos & Auditoría',
      subtitle: 'Checksums SHA-256 inmutables y ciclo de aprobación',
      icon: Box,
      badge: 'Módulo 08',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Inspecciona versiones registradas, copia el hash SHA-256 y simula el cambio de estados en el ciclo de vida del modelo corporativo.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            La aprobación final requiere el rol de <strong>PROJECT_LEAD</strong> o <strong>ADMIN</strong>.
          </div>
        </div>
      ),
      actionLabel: 'Ir al Registro',
      actionTab: 'model-registry'
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setWalkthroughOpen(false);
      setCurrentStep(0);
    }
  };

  const handleAction = () => {
    if (step.actionTab) {
      onNavigateTab(step.actionTab);
    }
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 shadow-glass border border-black/15 dark:border-white/15 space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setWalkthroughOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-xl glass-inset hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-zinc-900 dark:bg-white'
                  : 'w-1.5 bg-black/20 dark:bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 pt-1">
          <div className="p-2.5 rounded-2xl glass-inset border border-black/10 dark:border-white/15 text-zinc-900 dark:text-white/90">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-white/80 font-semibold border border-black/10 dark:border-white/10">
                {step.badge}
              </span>
              <span className="text-xs text-zinc-500 dark:text-white/40">Paso {currentStep + 1} de {steps.length}</span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">{step.title}</h2>
            <p className="text-xs text-zinc-600 dark:text-white/50">{step.subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div>{step.content}</div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-zinc-400 dark:text-white/40'
                : 'text-zinc-700 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white glass-inset'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-btn-primary text-xs font-semibold"
          >
            <span>{step.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
