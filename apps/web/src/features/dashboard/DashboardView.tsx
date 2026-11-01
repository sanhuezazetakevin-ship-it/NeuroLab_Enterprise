import React, { useState } from 'react';
import {
  FolderGit2,
  Cpu,
  PlayCircle,
  Box,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Maximize2,
  Shield,
  Layers
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';
import { EnlargedChartModal } from '../../components/common/EnlargedChartModal';

interface DashboardProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeScenario, setWalkthroughOpen, currentRole } = useDemo();
  const [enlargedClusterOpen, setEnlargedClusterOpen] = useState(false);

  const kpis = [
    {
      label: 'Exactitud Certificada',
      value: `${(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%`,
      icon: CheckCircle2,
      change: 'Test Set Verificado',
      subtext: '+2.4% vs baseline'
    },
    {
      label: 'Familia de Red',
      value: activeScenario.architecture.family,
      icon: Cpu,
      change: activeScenario.architecture.name,
      subtext: 'Compilado Keras v3'
    },
    {
      label: 'Volumen de Dataset',
      value: activeScenario.dataset.metadata.samples.toLocaleString(),
      icon: FolderGit2,
      change: activeScenario.dataset.name,
      subtext: 'Partición 70 / 15 / 15'
    },
    {
      label: 'Estado en Registro',
      value: activeScenario.modelVersion.status,
      icon: Box,
      change: `v${activeScenario.modelVersion.version}`,
      subtext: 'Inmutable SHA-256'
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Executive Frosted Glass Banner */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-white/80 border border-black/10 dark:border-white/10">
            Caso: {activeScenario.category}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-white/80 border border-black/10 dark:border-white/10">
            Rol: {currentRole}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-white/50 font-mono">Semana 11 • Deep Learning</span>
        </div>

        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            {activeScenario.title}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-white/60 leading-relaxed">
            {activeScenario.project.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={() => onNavigate('training')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-primary text-xs font-semibold"
          >
            <PlayCircle className="w-4 h-4" /> Abrir Orquestador
          </button>
          <button
            onClick={() => onNavigate('architectures')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <Cpu className="w-4 h-4 text-zinc-600 dark:text-white/70" /> Ver Topología
          </button>
          <button
            onClick={() => setWalkthroughOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            Guía de Demostración
          </button>
        </div>
      </div>

      {/* KPI Glass Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl glass-card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-white/60">{kpi.label}</span>
                <div className="p-1.5 rounded-xl glass-inset text-zinc-700 dark:text-white/70">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{kpi.value}</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-white/50 mt-1">
                  <span className="truncate">{kpi.change}</span>
                  <span className="font-mono text-zinc-700 dark:text-white/70 text-[10px]">{kpi.subtext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Jobs List (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Recent Training Jobs Table */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-white/90 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-zinc-600 dark:text-white/60" /> Trabajos Recientes de Entrenamiento
            </h2>
            <button
              onClick={() => onNavigate('training')}
              className="text-xs text-zinc-700 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/40 font-sans">
                  <th className="pb-2.5 font-medium">Job ID</th>
                  <th className="pb-2.5 font-medium">Familia</th>
                  <th className="pb-2.5 font-medium">Dataset</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                  <th className="pb-2.5 font-medium">Exactitud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors">
                  <td className="py-3 font-sans font-medium text-zinc-900 dark:text-white/90">
                    {activeScenario.initialJob.id}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] glass-inset text-zinc-700 dark:text-white/80 border border-black/10 dark:border-white/10">
                      {activeScenario.architecture.family}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-600 dark:text-white/60 font-sans truncate max-w-[150px]">
                    {activeScenario.dataset.name}
                  </td>
                  <td className="py-3 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-800 dark:text-white/90 font-medium px-2 py-0.5 rounded-full glass-inset border border-black/10 dark:border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completado
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-zinc-900 dark:text-white/90">
                    {(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Dock: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-zinc-600 dark:text-white/50 flex items-center justify-between px-1">
            <span>Infraestructura (Dock Lateral)</span>
            <span className="text-[10px] text-zinc-800 dark:text-white/70">Clic para ampliar</span>
          </div>

          {/* Compact Cluster Health Card */}
          <div
            onClick={() => setEnlargedClusterOpen(true)}
            className="glass-card p-4 rounded-2xl glass-card-hover cursor-pointer space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-white/90 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" /> Clúster & Memoria
              </span>
              <Maximize2 className="w-3 h-3 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors" />
            </div>

            <div>
              <div className="flex justify-between text-zinc-500 dark:text-white/50 text-[11px] mb-1.5">
                <span>Memoria Worker:</span>
                <span className="font-mono font-medium text-zinc-800 dark:text-white/80">1.8 / 8.0 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full glass-inset overflow-hidden border border-black/10 dark:border-white/10">
                <div className="h-full bg-zinc-800 dark:bg-white/80 rounded-full" style={{ width: '22.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-500 dark:text-white/50 text-[11px] mb-1.5">
                <span>Slots Concurrentes:</span>
                <span className="font-mono font-medium text-zinc-800 dark:text-white/80">1 / 4 slots</span>
              </div>
              <div className="w-full h-1.5 rounded-full glass-inset overflow-hidden border border-black/10 dark:border-white/10">
                <div className="h-full bg-zinc-500 dark:bg-white/50 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-white/40 pt-1 border-t border-black/5 dark:border-white/5">
              <span>PostgreSQL & Redis sincronizados</span>
              <span className="text-zinc-700 dark:text-white/70 font-medium">Detalles &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ENLARGED CLUSTER MODAL */}
      <EnlargedChartModal
        isOpen={enlargedClusterOpen}
        onClose={() => setEnlargedClusterOpen(false)}
        title="Monitor de Infraestructura del Clúster"
        subtitle="Asignación de hardware, límites de memoria y estado de workers en tiempo real"
        badge="Servicios en Línea"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">Worker Keras</span>
              <div className="text-base font-semibold text-zinc-900 dark:text-white mt-1">1.8 GB / 8.0 GB</div>
              <span className="text-[10px] text-zinc-600 dark:text-white/60">Saludable (22.5% asignado)</span>
            </div>

            <div className="p-4 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">Storage S3 (MinIO)</span>
              <div className="text-base font-semibold text-zinc-900 dark:text-white mt-1">580 MB / 50 GB</div>
              <span className="text-[10px] text-zinc-600 dark:text-white/60">Artefactos de modelos inmutables</span>
            </div>

            <div className="p-4 rounded-2xl glass-inset border border-black/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold tracking-wider">Conexión de Base de Datos</span>
              <div className="text-base font-semibold text-zinc-900 dark:text-white mt-1">Pool PostgreSQL Activo</div>
              <span className="text-[10px] text-zinc-600 dark:text-white/60">asyncpg / SQLAlchemy v2</span>
            </div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
