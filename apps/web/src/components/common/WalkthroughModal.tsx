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
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Plataforma enterprise para las operaciones curriculares de la <strong>Semana 11 (Machine Learning & Deep Learning)</strong>.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Principios Arquitectónicos</span>
            <ul className="space-y-1 list-disc list-inside text-slate-500 dark:text-slate-400">
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
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            El módulo de <strong>Fundamentos</strong> cuenta con un simulador interactivo del Perceptrón en el lateral derecho con gráficos vectoriales que se pueden ampliar al hacer clic.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px]">
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
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Configura capas para familias <strong>Feedforward (FNN)</strong>, <strong>Convolucionales (CNN)</strong>, <strong>Recurrentes (RNN/LSTM)</strong> y <strong>Generativas (GAN)</strong>.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px]">
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
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Lanza un entrenamiento asíncrono y observa en el panel lateral las curvas de <strong>Pérdida (Loss)</strong> y <strong>Exactitud (Accuracy)</strong>. Haz clic en cualquier gráfico para verlo a pantalla completa.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px]">
            Cuenta con simulación de velocidad y botón de cancelación cooperativa.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Entrenamientos',
      actionTab: 'training'
    },
    {
      title: '4. Gobernanza & Model Registry',
      subtitle: 'Inmutabilidad SHA-256 y ciclo de vida de artefactos',
      icon: Box,
      badge: 'Módulo 08',
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Cada modelo entrenado transita por los estados: <code className="font-mono">DRAFT</code> &rarr; <code className="font-mono">REVIEWED</code> &rarr; <code className="font-mono">APPROVED</code> &rarr; <code className="font-mono">RETIRED</code>.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px]">
            Genera la ficha técnica formal y exporta a formato CSV o PDF imprimible con un clic.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Registro',
      actionTab: 'model-registry'
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setWalkthroughOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDirectJump = () => {
    if (current.actionTab) {
      onNavigateTab(current.actionTab);
      setWalkthroughOpen(false);
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {current.badge} • Paso {currentStep + 1} de {steps.length}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={() => setWalkthroughOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{current.subtitle}</p>
          {current.content}

          {/* Stepper dots */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-blue-600 dark:bg-blue-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
              currentStep === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          <div className="flex items-center gap-2">
            {current.actionTab && (
              <button
                onClick={handleDirectJump}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <span>{currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
