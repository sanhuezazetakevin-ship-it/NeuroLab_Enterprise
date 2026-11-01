import React from 'react';
import {
  FolderGit2,
  Cpu,
  PlayCircle,
  Box,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { useDemo } from '../../lib/DemoContext';

interface DashboardProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeScenario, setWalkthroughOpen, isDemoMode, currentRole } = useDemo();

  const kpis = [
    {
      label: 'Exactitud Modelo Certificado',
      value: `${(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%`,
      icon: CheckCircle2,
      change: 'Test Set Verificado',
      color: 'text-emerald-400'
    },
    {
      label: 'Familia Arquitectónica Activa',
      value: activeScenario.architecture.family,
      icon: Cpu,
      change: `${activeScenario.architecture.name}`,
      color: 'text-cyan-400'
    },
    {
      label: 'Muestras en Dataset',
      value: activeScenario.dataset.metadata.samples.toLocaleString(),
      icon: FolderGit2,
      change: activeScenario.dataset.name,
      color: 'text-indigo-400'
    },
    {
      label: 'Estado en Model Registry',
      value: activeScenario.modelVersion.status,
      icon: Box,
      change: activeScenario.modelVersion.version,
      color: 'text-amber-400'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Scenario Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Caso de Demostración: {activeScenario.category}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              Rol Activo: {currentRole}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Semana 11 • Deep Learning</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeScenario.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {activeScenario.project.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('training')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25"
            >
              <PlayCircle className="w-4 h-4" /> Lanzar Entrenamiento en Vivo
            </button>
            <button
              onClick={() => onNavigate('architectures')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <Cpu className="w-4 h-4 text-emerald-400" /> Inspeccionar Topología
            </button>
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Iniciar Tour de Cliente
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
                <div className={`p-2 rounded-xl bg-slate-800/80 ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{kpi.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Active Training Summary & Cluster Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Runs Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Historial de Entrenamientos Recientes
              </h2>
              <button
                onClick={() => onNavigate('training')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Ir al Orquestador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-sans">
                    <th className="pb-2.5 font-semibold">Trabajo (Job)</th>
                    <th className="pb-2.5 font-semibold">Familia</th>
                    <th className="pb-2.5 font-semibold">Dataset</th>
                    <th className="pb-2.5 font-semibold">Estado</th>
                    <th className="pb-2.5 font-semibold">Exactitud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-sans font-bold text-slate-200">
                      {activeScenario.initialJob.id}
                      <div className="text-[10px] text-slate-500 font-normal">Épocas: {activeScenario.initialJob.hyperparameters.epochs}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                        {activeScenario.architecture.family}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-sans truncate max-w-[150px]">
                      {activeScenario.dataset.name}
                    </td>
                    <td className="py-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      {(activeScenario.modelVersion.metricsSummary.accuracy * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>¿Deseas probar otro caso de negocio?</span>
            <span className="text-emerald-400 font-semibold">Usa el selector de arriba para cambiar a Salud (CNN) o Energía (LSTM)</span>
          </div>
        </div>

        {/* System & Hardware Health */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> Estado del Clúster & Cuotas
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Memoria del Worker Keras</span>
                <span className="text-slate-200 font-mono font-bold">1.8 GB / 8.0 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Almacenamiento en MinIO S3</span>
                <span className="text-slate-200 font-mono font-bold">580 MB / 50 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '1.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Slots Concurrentes de Worker</span>
                <span className="text-slate-200 font-mono font-bold">1 / 4 En uso</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>PostgreSQL & Redis Pub/Sub en línea</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Subprocesos aislados para evitar ejecuciones arbitrarias o bloqueos en la interfaz de usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
