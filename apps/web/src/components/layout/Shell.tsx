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
  } = useDemo();

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: FolderGit2 },
    { id: 'fundamentals', label: 'Fundamentos', icon: BookOpen, badge: 'S11' },
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
    <div className="flex h-screen w-screen overflow-hidden p-3 gap-3">
      {/* FLOATING GLASS SIDEBAR (VisionOS Style) */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 ease-out glass-panel rounded-2xl flex flex-col z-30 select-none shrink-0 shadow-glass`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.06]">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-white/10 light:bg-black/10 flex items-center justify-center text-white dark:text-white light:text-zinc-900 border border-white/20 dark:border-white/20 light:border-black/10 shadow-glass-sm">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold tracking-tight text-white dark:text-white light:text-zinc-900 flex items-center gap-1.5 text-sm">
                  NeuroLab <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 dark:bg-white/10 text-white/80 dark:text-white/80 border border-white/15 font-mono">ENTERPRISE</span>
                </span>
                <p className="text-[10px] text-white/50 dark:text-white/50 light:text-zinc-500 font-medium">Deep Learning • Semana 11</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-glass-sm">
              <Network className="w-4 h-4" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-3 px-2.5 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 dark:bg-white/15 light:bg-black/10 text-white dark:text-white light:text-zinc-950 border border-white/20 dark:border-white/20 light:border-black/10 shadow-glass-sm'
                    : 'text-white/60 dark:text-white/60 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/[0.06] dark:hover:bg-white/[0.06] light:hover:bg-black/[0.04]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-white light:text-zinc-900' : 'text-white/50 dark:text-white/50 light:text-zinc-500'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 font-mono border border-white/10">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Client Tour Shortcut */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="w-full p-2.5 rounded-xl glass-inset hover:border-white/20 flex items-center gap-2.5 transition-all text-left group"
            >
              <div className="p-1 rounded-lg bg-white/10 text-white/80">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 dark:text-white/90 light:text-zinc-800 leading-none">Guía de Cliente</p>
                <p className="text-[10px] text-white/50 dark:text-white/50 light:text-zinc-500 truncate mt-0.5">Recorrido por módulos</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Worker Status Indicator */}
        <div className="p-3 border-t border-white/[0.08] dark:border-white/[0.08]">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl glass-inset flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <div>
                  <p className="font-medium text-white/90 dark:text-white/90 light:text-zinc-800 leading-none">TensorFlow Engine</p>
                  <p className="text-[10px] text-white/50 dark:text-white/50 light:text-zinc-500 mt-0.5">Worker en Línea</p>
                </div>
              </div>
              <Activity className="w-3.5 h-3.5 text-white/60" />
            </div>
          ) : (
            <div className="flex justify-center" title="Worker TensorFlow Listo">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-3">
        {/* FLOATING GLASS TOPBAR */}
        <header className="glass-panel rounded-2xl h-14 px-5 flex items-center justify-between z-20 shrink-0 shadow-glass">
          {/* Left: Project Selector & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-inset hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/90 dark:text-white/90 light:text-zinc-800 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-white/70" />
                <span className="max-w-[200px] truncate">{activeProject.name}</span>
                <ChevronRight className="w-3 h-3 text-white/50 rotate-90 ml-0.5" />
              </button>

              {/* Project Dropdown */}
              {showProjectMenu && (
                <div className="absolute left-0 mt-2 w-80 glass-panel rounded-2xl p-2 z-50 shadow-glass animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-semibold text-white/40 dark:text-white/40 px-3 py-1.5 uppercase tracking-wider">
                    Cambiar Proyecto Activo
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        setShowProjectMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        p.id === activeProject.id
                          ? 'bg-white/15 text-white font-medium border border-white/20'
                          : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === activeProject.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-white/10 dark:bg-white/10 hidden sm:block" />

            {/* Scenario Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-inset hover:bg-white/[0.08] border border-white/10 text-[11px] font-medium text-white/80 dark:text-white/80 light:text-zinc-700 transition-colors"
              >
                <span className="text-white/40 dark:text-white/40">Caso:</span>
                <span className="font-semibold">{DEMO_SCENARIOS[activeScenarioId]?.title || 'Demo'}</span>
                <ChevronRight className="w-3 h-3 text-white/50 rotate-90 ml-0.5" />
              </button>

              {showScenarioMenu && (
                <div className="absolute left-0 mt-2 w-80 glass-panel rounded-2xl p-2 z-50 shadow-glass animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-semibold text-white/40 px-3 py-1.5 uppercase tracking-wider">
                    Seleccionar Caso de Demostración
                  </div>
                  {Object.values(DEMO_SCENARIOS).map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        switchScenario(sc.id);
                        setShowScenarioMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors mb-1 ${
                        sc.id === activeScenarioId
                          ? 'bg-white/15 text-white font-medium border border-white/20'
                          : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sc.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                          {sc.architecture.family}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-0.5">{sc.subtitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Theme Toggle, Role Selector */}
          <div className="flex items-center gap-2.5">
            {/* FUNCTIONAL DARK / LIGHT MODE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass-inset hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-white/90 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-800 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>

            {/* RBAC Role Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-inset hover:bg-white/10 text-xs text-white/80 dark:text-white/80 light:text-zinc-700 font-medium transition-colors"
                title="Cambiar rol RBAC"
              >
                <UserCheck className="w-3.5 h-3.5 text-white/60" />
                <span className="font-mono text-[11px] font-semibold">{currentRole}</span>
                <ChevronRight className="w-3 h-3 text-white/50 rotate-90 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-2 z-50 shadow-glass animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-semibold text-white/40 px-3 py-1.5 uppercase tracking-wider">
                    Simular Rol de Usuario
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col mb-1 ${
                        r.id === currentRole
                          ? 'bg-white/15 text-white font-medium border border-white/20'
                          : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">{r.id}</span>
                      </div>
                      <span className="text-[10px] text-white/50 mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleDemoMode}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl glass-inset hover:bg-white/10 text-white/80 dark:text-white/80 border border-white/10 transition-colors"
            >
              {isDemoMode ? 'Demo Activa' : 'Live Mode'}
            </button>
          </div>
        </header>

        {/* VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto pr-1">
          {children}
        </main>
      </div>
    </div>
  );
};
