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
  Bell,
  Search,
  Layers,
  Activity,
  CheckCircle2,
  Menu,
  UserCheck,
  HelpCircle,
  Sun,
  Moon,
  Network
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
    theme,
    toggleTheme,
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
    { id: 'projects', label: 'Proyectos', icon: FolderGit2 },
    { id: 'fundamentals', label: 'Fundamentos (S11)', icon: BookOpen, badge: 'S11' },
    { id: 'architectures', label: 'Diseñador de Redes', icon: Cpu },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'training', label: 'Entrenamientos', icon: PlayCircle },
    { id: 'evaluation', label: 'Evaluación & Métricas', icon: LineChart },
    { id: 'model-registry', label: 'Registro de Modelos', icon: Box },
    { id: 'reports', label: 'Ficha Técnica', icon: FileSpreadsheet },
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 select-none shadow-sm`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  NeuroLab <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">ENTERPRISE</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Deep Learning • Semana 11</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Network className="w-4 h-4" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold border border-slate-200 dark:border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Client Tour Shortcut in Sidebar */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/30 flex items-center gap-2.5 transition-all text-left group"
            >
              <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">Guía de Plataforma</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Recorrido paso a paso</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Worker Status Indicator */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          {!collapsed ? (
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none">TensorFlow Engine</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Worker Asíncrono Listo</p>
                </div>
              </div>
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <div className="flex justify-center" title="Worker TensorFlow Listo">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* SUBTLE DEMO CONTROL STRIP */}
        <div className="h-9 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-xs z-30 select-none">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modo Demostración:
            </span>

            {/* Scenario Selector */}
            <div className="relative">
              <button
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span>{DEMO_SCENARIOS[activeScenarioId]?.title || 'Caso de Demostración'}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90 ml-0.5" />
              </button>

              {showScenarioMenu && (
                <div className="absolute left-0 mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Seleccionar Caso de Estudio
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
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{sc.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                          {sc.architecture.family}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{sc.subtitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDemoMode}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                isDemoMode
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isDemoMode ? 'Simulador Activo' : 'Conexión Live'}
            </button>
          </div>
        </div>

        {/* TOP HEADER */}
        <header className="h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-20">
          {/* Left: Project Selector & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="max-w-[220px] truncate">{activeProject.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90 ml-0.5" />
              </button>

              {/* Project Dropdown */}
              {showProjectMenu && (
                <div className="absolute left-0 mt-1.5 w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
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
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === activeProject.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle, Role Selector, User Profile */}
          <div className="flex items-center gap-2.5">
            {/* FUNCTIONAL DARK / LIGHT MODE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>

            {/* RBAC Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
                title="Cambiar perspectiva de permisos (RBAC)"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-[11px] font-semibold">{currentRole}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
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
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{r.name}</span>
                        {r.id === currentRole && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                GA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">Gabriel</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">Ingeniero IA</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
