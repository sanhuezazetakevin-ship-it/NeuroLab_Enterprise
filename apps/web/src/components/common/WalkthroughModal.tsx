import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
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
  const { walkthroughOpen, setWalkthroughOpen, activeScenario, switchScenario } = useDemo();
  const [currentStep, setCurrentStep] = useState(0);

  if (!walkthroughOpen) return null;

  const steps = [
    {
      title: 'Bienvenido a NeuroLab Enterprise',
      subtitle: 'Plataforma empresarial para el ciclo de vida de Redes Neuronales Artificiales',
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'Visión General',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Esta plataforma transforma el contenido curricular de la <strong>Semana 11 (Machine Learning & Deep Learning)</strong> en un entorno productivo de nivel industrial.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Principios de Arquitectura</span>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li><strong>Desacoplamiento:</strong> Los entrenamientos ocurren en workers aislados, nunca bloquean la web.</li>
              <li><strong>Trazabilidad:</strong> Modelos inmutables con hashes SHA-256 de integridad.</li>
              <li><strong>Validación estricta:</strong> La API FastAPI valida matemáticamente los tensores en servidor.</li>
            </ul>
          </div>
        </div>
      ),
      actionLabel: 'Comenzar Recorrido',
      actionTab: null
    },
    {
      title: '1. Fundamentos Neuronales Interactivos',
      subtitle: 'Operación Semana 11: neuronas, capas, pesos, sesgos y activaciones',
      icon: BookOpen,
      color: 'text-indigo-400',
      badge: 'Módulo 03',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            El módulo de <strong>Fundamentos</strong> cuenta con un simulador interactivo donde puedes modificar entradas, pesos sinápticos (<code className="text-emerald-400">w1, w2</code>) y sesgo (<code className="text-indigo-300">bias</code>) para ver en tiempo real la combinación lineal y la curva de activación elegida (ReLU, Sigmoid, Tanh, Softmax).
          </p>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            💡 <strong>Prueba práctica:</strong> Desliza los controles y observa cómo cambia el potencial de disparo de la neurona.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Fundamentos (S11)',
      actionTab: 'fundamentals'
    },
    {
      title: '2. Diseñador Visual de Topologías',
      subtitle: 'Construcción con validación dimensional y familias de redes',
      icon: Cpu,
      color: 'text-cyan-400',
      badge: 'Módulo 04',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Diseña arquitecturas para 4 familias: <strong>Feedforward (FNN)</strong>, <strong>Convolucionales (CNN)</strong>, <strong>Recurrentes (RNN/LSTM)</strong> y <strong>Generativas (GAN)</strong>.
          </p>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            🛡️ <strong>Seguridad matemática:</strong> El botón "Validar en Servidor" ejecuta la comprobación de formas de tensores y parámetros entrenables en FastAPI antes de autorizar el entrenamiento.
          </div>
        </div>
      ),
      actionLabel: 'Ir al Diseñador',
      actionTab: 'architectures'
    },
    {
      title: '3. Telemetría de Entrenamiento en Vivo',
      subtitle: 'Worker Keras asíncrono y streaming de métricas sin recargar',
      icon: PlayCircle,
      color: 'text-amber-400',
      badge: 'Módulo 06',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Lanza un entrenamiento y observa las curvas continuas de <strong>Pérdida (Loss)</strong> y <strong>Exactitud (Accuracy)</strong> en tiempo real, junto con la terminal de logs y la opción de cancelación cooperativa.
          </p>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            ⚡ <strong>Modo Demo Activo:</strong> Puedes iniciar y pausar el entrenamiento en cualquier momento con datos realistas simulados.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Entrenamientos',
      actionTab: 'training'
    },
    {
      title: '4. Gobernanza y Model Registry',
      subtitle: 'Inmutabilidad criptográfica, auditoría y certificación',
      icon: Box,
      color: 'text-emerald-400',
      badge: 'Módulos 08 y 10',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Cada modelo completado recibe un hash SHA-256 inviolable y transita por los estados: <code className="text-amber-400">DRAFT</code> &rarr; <code className="text-indigo-400">REVIEWED</code> &rarr; <code className="text-emerald-400">APPROVED</code> &rarr; <code className="text-red-400">RETIRED</code>.
          </p>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            📋 <strong>Reportes Ejecutivos:</strong> Exporta la ficha técnica completa en formato imprimible/PDF o CSV con un solo clic.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Model Registry',
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-slate-800 ${current.color}`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {current.badge} • Paso {currentStep + 1} de {steps.length}
              </span>
              <h3 className="text-base font-bold text-white mt-1 leading-snug">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={() => setWalkthroughOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400">{current.subtitle}</p>
          {current.content}

          {/* Stepper dots */}
          <div className="flex justify-center items-center gap-1.5 pt-3">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
              currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex items-center gap-2">
            {current.actionTab && (
              <button
                onClick={handleDirectJump}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>{currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
