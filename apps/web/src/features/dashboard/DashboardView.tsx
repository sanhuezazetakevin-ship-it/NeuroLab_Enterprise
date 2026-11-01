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
  Maximize2
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
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Familia de Red',
      value: activeScenario.architecture.family,
      icon: Cpu,
      change: activeScenario.architecture.name,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Volumen de Dataset',
      value: activeScenario.dataset.metadata.samples.toLocaleString(),
      icon: FolderGit2,
      change: activeScenario.dataset.name,
      color: 'text-slate-700 dark:text-slate-300'
    },
    {
      label: 'Estado en Registro',
      value: activeScenario.modelVersion.status,
      icon: Box,
      change: activeScenario.modelVersion.version,
      color: 'text-amber-600 dark:text-amber-400'
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Executive Clean Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
              Caso: {activeScenario.category}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Rol: {currentRole}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Semana 11 • Deep Learning</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeScenario.title}
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeScenario.project.description}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('training')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Abrir Orquestador
            </button>
            <button
              onClick={() => onNavigate('architectures')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Ver Topología
            </button>
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors"
            >
              Guía de Demostración
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{kpi.value}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{kpi.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Jobs List (2 cols) + Right Compact Previews (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Recent Training Jobs Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Trabajos Recientes de Entrenamiento
            </h2>
            <button
              onClick={() => onNavigate('training')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                  <th className="pb-2 font-semibold">Job ID</th>
                  <th className="pb-2 font-semibold">Familia</th>
                  <th className="pb-2 font-semibold">Dataset</th>
                  <th className="pb-2 font-semibold">Estado</th>
                  <th className="pb-2 font-semibold">Exactitud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 font-sans font-bold text-slate-800 dark:text-slate-200">
                    {activeScenario.initialJob.id}
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {activeScenario.architecture.family}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400 font-sans truncate max-w-[140px]">
                    {activeScenario.dataset.name}
                  </td>
                  <td className="py-2.5 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Completado
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Dock: Compact Previews with Click-to-Enlarge */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>Infraestructura (Miniatura)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Clic para ampliar</span>
          </div>

          {/* Compact Cluster Health Card */}
          <div
            onClick={() => setEnlargedClusterOpen(true)}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs group space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Clúster & Memoria
              </span>
              <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>

            <div>
              <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                <span>Memoria Worker:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1.8 / 8.0 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: '22.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                <span>Slots Concurrentes:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1 / 4 en uso</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>PostgreSQL & Redis sincronizados</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Detalles &rarr;</span>
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Worker Keras</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">1.8 GB / 8.0 GB</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Saludable (22.5% asignado)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Storage S3 (MinIO)</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">580 MB / 50 GB</div>
              <span className="text-[10px] text-slate-400">Artefactos de modelos inmutables</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Conexión de Base de Datos</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">Pool PostgreSQL Activo</div>
              <span className="text-[10px] text-slate-400">asyncpg / SQLAlchemy v2</span>
            </div>
          </div>
        </div>
      </EnlargedChartModal>
    </div>
  );
};
