import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  BookOpen,
  Cpu,
  PlayCircle,
  Box,
  Layers,
  ArrowRight,
  Database,
  FolderGit2,
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import type { NavTab } from '../layout/Shell';

interface WalkthroughModalProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ onNavigateTab }) => {
  const { walkthroughOpen, setWalkthroughOpen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!walkthroughOpen) return null;

  const steps = [
    {
      title: 'NeuroLab Enterprise',
      subtitle: 'Plataforma real para diseñar, entrenar y gobernar redes neuronales',
      icon: Layers,
      badge: 'Semana 11',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Esta instancia opera contra la API <strong>/api/v1</strong>, PostgreSQL y workers
            TensorFlow/Keras aislados. No hay datos simulados: todo lo que ve proviene de su
            proyecto y de la cola de entrenamientos.
          </p>
          <div className="p-3.5 rounded-2xl glass-inset space-y-1.5 border border-black/10 dark:border-white/10">
            <span className="text-[11px] font-semibold text-zinc-900 dark:text-white/90 uppercase tracking-wider">
              Flujo verificado
            </span>
            <ul className="space-y-1 list-disc list-inside text-zinc-600 dark:text-white/60">
              <li>Autenticación JWT y permisos por rol efectivo del proyecto.</li>
              <li>Entrenamiento asíncrono real con telemetría persistida por época.</li>
              <li>Versiones de modelo inmutables con checksum SHA-256 descargable.</li>
            </ul>
          </div>
        </div>
      ),
      actionLabel: 'Iniciar recorrido',
      actionTab: null as NavTab | null,
    },
    {
      title: '1. Proyectos y acceso',
      subtitle: 'Espacios aislados con roles y trazabilidad',
      icon: FolderGit2,
      badge: 'Módulo 02',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Cree un proyecto o seleccione uno existente. El rol efectivo determina qué puede
            hacer: los roles <strong>VIEWER</strong> y <strong>REVIEWER</strong> solo consultan,
            mientras que <strong>AI_ENGINEER</strong>, <strong>PROJECT_LEAD</strong> y{' '}
            <strong>ADMIN</strong> pueden cargar datos y entrenar.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            El selector de proyecto en la barra superior cambia el contexto de todos los módulos.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Proyectos',
      actionTab: 'projects' as NavTab,
    },
    {
      title: '2. Fundamentos y arquitecturas',
      subtitle: 'Perceptrón, funciones de activación y validación dimensional',
      icon: Cpu,
      badge: 'Módulos 03–04',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Revise los fundamentos neuronales y luego configure una topología. La API valida
            dimensiones, parámetros y compatibilidad de capas antes de guardar.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            En esta versión el entrenamiento está habilitado para redes{' '}
            <strong>Feedforward</strong>. Las familias RNN, CNN y GAN se pueden diseñar y guardar,
            pero la API devolverá un motivo explícito si intenta entrenarlas.
          </div>
        </div>
      ),
      actionLabel: 'Ir al Diseñador',
      actionTab: 'architectures' as NavTab,
    },
    {
      title: '3. Datasets verificados',
      subtitle: 'CSV con validación de esquema, target y checksum',
      icon: Database,
      badge: 'Módulo 05',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Cargue un archivo CSV indicando la columna objetivo. El servidor valida encabezados,
            tamaño, filas mínimas y tipos, calcula el SHA-256 y persiste una vista previa y los
            conteos de nulos.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            Un dataset sin columna objetivo no podrá usarse para entrenar.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Datasets',
      actionTab: 'datasets' as NavTab,
    },
    {
      title: '4. Entrenamiento y telemetría',
      subtitle: 'Cola Redis, worker Keras y SSE con recuperación',
      icon: PlayCircle,
      badge: 'Módulo 06',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Inicie un trabajo con arquitectura y dataset verificados. El estado avanza{' '}
            <strong>QUEUED → PREPARING → RUNNING → COMPLETED / FAILED / CANCELLED</strong>. Las
            curvas llegan por SSE y se reconstruyen desde PostgreSQL al reconectar.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            La cancelación es cooperativa: el worker la aplica al finalizar la época en curso.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Entrenamientos',
      actionTab: 'training' as NavTab,
    },
    {
      title: '5. Evaluación y registro',
      subtitle: 'Métricas de prueba, ciclo de vida y artefacto inmutable',
      icon: Box,
      badge: 'Módulos 07–09',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            Al completar, el worker evalúa el conjunto de prueba y registra una versión{' '}
            <strong>DRAFT</strong> con métricas y checksum. Revise la matriz de confusión, apruebe
            o retire la versión según su rol y descargue el artefacto <code>.keras</code>.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            La aprobación requiere <strong>PROJECT_LEAD</strong> o <strong>ADMIN</strong>. Cada
            cambio de estado queda en el registro de auditoría.
          </div>
        </div>
      ),
      actionLabel: 'Ir al Registro',
      actionTab: 'model-registry' as NavTab,
    },
    {
      title: 'Fundamentos interactivos',
      subtitle: 'Simulador del perceptrón y familias de redes',
      icon: BookOpen,
      badge: 'Módulo 03',
      content: (
        <div className="space-y-3 text-xs text-zinc-700 dark:text-white/70">
          <p>
            El módulo de Fundamentos incluye un simulador del perceptrón con pesos, sesgo y
            función de activación, además de la referencia de familias y capas estándar.
          </p>
          <div className="p-3 rounded-2xl glass-inset border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white/80 text-[11px]">
            Ajuste los controles y observe el potencial de disparo calculado en el navegador.
          </div>
        </div>
      ),
      actionLabel: 'Ir a Fundamentos',
      actionTab: 'fundamentals' as NavTab,
    },
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
    if (step.actionTab) onNavigateTab(step.actionTab);
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

        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-zinc-900 dark:bg-white' : 'w-1.5 bg-black/20 dark:bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex items-start gap-3 pt-1">
          <div className="p-2.5 rounded-2xl glass-inset border border-black/10 dark:border-white/15 text-zinc-900 dark:text-white/90">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-white/80 font-semibold border border-black/10 dark:border-white/10">
                {step.badge}
              </span>
              <span className="text-xs text-zinc-500 dark:text-white/40">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">{step.title}</h2>
            <p className="text-xs text-zinc-600 dark:text-white/50">{step.subtitle}</p>
          </div>
        </div>

        <div>{step.content}</div>

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
