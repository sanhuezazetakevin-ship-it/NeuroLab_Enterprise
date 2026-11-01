import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  BookOpen,
  Cpu,
  Database,
  PlayCircle,
  LineChart,
  Box,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Bell,
  Search,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  UserCheck,
  SlidersHorizontal,
  HelpCircle,
  Flame,
  Radio
} from 'lucide-react';
import { Project, UserRole } from '../../types';
import { useDemo } from '../../lib/DemoContext';
import { DEMO_SCENARIOS } from '../../lib/demoData';

export type NavTab = 
  | 'dashboard' 
  | 'projects' 
  | 'fundamentals' 
  | 'architectures' 
  | 'datasets' 
  | 'training' 
  | 'evaluation' 
  | 'model-registry' 
  | 'reports' 
  | 'administration';

interface ShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeProject: Project;
  onSelectProject: (p: Project) => void;
  projects: Project[];
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  onSelectProject,
  projects,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const {
    isDemoMode,
    toggleDemoMode,
    activeScenarioId,
    switchScenario,
    currentRole,
    switchRole,
    setWalkthroughOpen,
    showToast
  } = useDemo();

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos de IA', icon: FolderGit2 },
    { id: 'fundamentals', label: 'Fundamentos (Sem. 11)', icon: BookOpen, badge: 'S11' },
    { id: 'architectures', label: 'Diseñador de Redes', icon: Cpu },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'training', label: 'Entrenamientos', icon: PlayCircle },
    { id: 'evaluation', label: 'Evaluación & Métricas', icon: LineChart },
    { id: 'model-registry', label: 'Model Registry', icon: Box },
    { id: 'reports', label: 'Reportes', icon: FileSpreadsheet },
    { id: 'administration', label: 'Administración', icon: ShieldCheck },
  ];

  const rolesList: { id: UserRole; name: string; desc: string }[] = [
    { id: 'AI_ENGINEER', name: 'Ingeniero de IA', desc: 'Diseño, entrenamiento y evaluación técnica' },
    { id: 'PROJECT_LEAD', name: 'Responsable de Proyecto', desc: 'Aprobación de modelos y gestión de equipo' },
    { id: 'ADMIN', name: 'Administrador Global', desc: 'Control de cuotas, RBAC y auditoría' },
    { id: 'REVIEWER', name: 'Revisor / Auditor', desc: 'Certificación y benchmarks en solo lectura' },
    { id: 'VIEWER', name: 'Lector Ejecutivo', desc: 'Visualización de reportes y dashboards' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col z-30 select-none`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/90">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/30 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
                  NeuroLab <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">ENT</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Deep Learning • Semana 11</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 mx-auto rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-3 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Guided Tour Banner in Sidebar */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/50 flex items-center gap-2.5 transition-all text-left shadow-lg shadow-indigo-950/30 group"
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-none">Tour para Clientes</p>
                <p className="text-[10px] text-slate-400 truncate mt-1">Guía interactiva 3 min</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Worker & System Health Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Worker TensorFlow</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Asíncrono • En línea</p>
                </div>
              </div>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          ) : (
            <div className="flex justify-center" title="Worker TensorFlow Listo">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* DEMO MODE CONTROL BAR */}
        <div className="h-10 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-b border-emerald-500/20 px-6 flex items-center justify-between text-xs z-30 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-emerald-400 text-[10px]">
                Modo Demostración Interactivo
              </span>
            </div>

            <div className="h-3 w-[1px] bg-slate-700 hidden sm:block" />

            {/* Scenario Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[200px] truncate">{DEMO_SCENARIOS[activeScenarioId]?.title || 'Escenario'}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90 ml-0.5" />
              </button>

              {showScenarioMenu && (
                <div className="absolute left-0 mt-1.5 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Seleccionar Caso de Demostración
                  </div>
                  {Object.values(DEMO_SCENARIOS).map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        switchScenario(sc.id);
                        setShowScenarioMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors mb-1 ${
                        sc.id === activeScenarioId
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{sc.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono">
                          {sc.architecture.family}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sc.subtitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Tour Trigger & Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guía de Cliente</span>
            </button>

            <button
              onClick={toggleDemoMode}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                isDemoMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isDemoMode ? 'SIMULADOR: ACTIVO' : 'MODO LIVE'}
            </button>
          </div>
        </div>

        {/* TOP HEADER */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-20">
          {/* Breadcrumbs & Active Project Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Proyecto:</span>
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[220px] truncate">{activeProject.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90 ml-1" />
              </button>

              {/* Project Dropdown */}
              {showProjectMenu && (
                <div className="absolute left-0 mt-2 w-84 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                    Cambiar Proyecto Activo
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        setShowProjectMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        p.id === activeProject.id
                          ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === activeProject.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
              <span>Sección</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-200 capitalize font-medium">{currentTab.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Right Header: Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* RBAC Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold transition-colors"
                title="Cambiar perspectiva de permisos (RBAC)"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-white font-mono text-[11px]">{currentRole}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Simular Rol RBAC
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col ${
                        r.id === currentRole
                          ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{r.name}</span>
                        {r.id === currentRole && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => showToast('No hay alertas críticas en la cola de workers.', 'info')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                GA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">Gabriel (AI Engineer)</p>
                <p className="text-[10px] text-emerald-400 font-medium leading-none mt-1">lead.enterprise</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
