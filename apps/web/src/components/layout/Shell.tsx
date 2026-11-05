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
  Layers,
  Activity,
  CheckCircle2,
  Menu,
  UserCheck,
  HelpCircle,
  Sun,
  Moon,
  Network,
  RefreshCw,
  LogOut,
  UserCircle2,
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { useAuth } from '../../lib/AuthContext';
import {
  PROJECT_STATUS_LABELS,
  ROLE_LABELS,
  labelFor,
} from '../../lib/labels';
import { Project } from '../../types';

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
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentTab, onSelectTab, children }) => {
  const {
    theme,
    toggleTheme,
    currentRole,
    activeProject,
    setActiveProject,
    projects,
    refreshProjects,
    projectsLoading,
    projectsError,
    setWalkthroughOpen,
  } = useApp();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: FolderGit2 },
    { id: 'fundamentals', label: 'Fundamentos', icon: BookOpen, badge: 'S11' },
    { id: 'architectures', label: 'Diseñador de Redes', icon: Cpu },
    { id: 'datasets', label: 'Conjuntos de datos', icon: Database },
    { id: 'training', label: 'Entrenamientos', icon: PlayCircle },
    { id: 'evaluation', label: 'Evaluación & Métricas', icon: LineChart },
    { id: 'model-registry', label: 'Registro de Modelos', icon: Box },
    { id: 'reports', label: 'Ficha Técnica', icon: FileSpreadsheet },
    { id: 'administration', label: 'Administración', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => !item.adminOnly || currentRole === 'ADMIN');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setShowProjectMenu(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden p-3 gap-3">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 ease-out glass-panel rounded-2xl flex flex-col z-30 select-none shrink-0 shadow-glass`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/10 dark:border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(225,29,72,0.3)]">
                <Network className="w-4 h-4 text-rose-600 dark:text-rose-500 drop-shadow-sm dark:drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </div>
              <div>
                <span className="font-semibold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 text-sm">
                  NeuroLab{' '}
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 font-mono">
                    ENTERPRISE
                  </span>
                </span>
                <p className="text-[10px] text-zinc-500 dark:text-white/50 font-medium">
                  Aprendizaje profundo • Semana 11
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-xl bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(225,29,72,0.3)]">
              <Network className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <div className="flex-1 py-3 px-2.5 overflow-y-auto space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm dark:bg-gradient-to-r dark:from-rose-950/70 dark:via-rose-900/40 dark:to-rose-950/20 dark:text-white dark:border-rose-500/40 dark:shadow-[0_0_15px_rgba(225,29,72,0.25)] font-semibold'
                    : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-rose-950/20'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-rose-600 dark:text-rose-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] scale-105' : 'text-zinc-500 dark:text-white/50'
                  }`}
                />
                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono border ${
                    isActive
                      ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/25 dark:text-rose-300 dark:border-rose-500/40'
                      : 'bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-white/70 border-black/10 dark:border-white/10'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!collapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setWalkthroughOpen(true)}
              className="w-full p-2.5 rounded-xl glass-inset hover:border-rose-500/30 flex items-center gap-2.5 transition-all text-left group"
            >
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-white/90 leading-none">Guía de Cliente</p>
                <p className="text-[10px] text-zinc-500 dark:text-white/50 truncate mt-0.5">Flujo real de la plataforma</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-white/40 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        <div className="p-3 border-t border-black/10 dark:border-white/10">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl glass-inset flex items-center justify-between text-xs border border-rose-500/15">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 shadow-[0_0_10px_#f43f5e]" />
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white/90 leading-none">Worker Keras</p>
                  <p className="text-[10px] text-zinc-500 dark:text-white/50 mt-0.5">Telemetría asíncrona</p>
                </div>
              </div>
              <Activity className="w-3.5 h-3.5 text-rose-500/80 animate-pulse" />
            </div>
          ) : (
            <div className="flex justify-center" title="Worker de entrenamiento asíncrono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 shadow-[0_0_10px_#f43f5e]" />
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-3">
        <header className="glass-panel rounded-2xl h-14 px-5 flex items-center justify-between z-20 shrink-0 shadow-glass">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative min-w-0">
              <button
                onClick={() => setShowProjectMenu((value) => !value)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-inset hover:bg-black/5 dark:hover:bg-white/[0.08] border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-white/90 transition-colors max-w-[260px]"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70 shrink-0" />
                <span className="truncate">
                  {activeProject ? activeProject.name : projectsLoading ? 'Cargando proyectos…' : 'Sin proyecto activo'}
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-white/50 rotate-90 ml-0.5 shrink-0" />
              </button>

              {showProjectMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProjectMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-88 sm:w-96 bg-white dark:bg-[#0c0d14] rounded-2xl p-2.5 z-50 shadow-2xl border border-zinc-200 dark:border-rose-500/30 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100 dark:border-white/10 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-white/50 uppercase tracking-wider">
                        Proyecto activo
                      </span>
                      <button
                        onClick={handleRefresh}
                        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 transition-colors"
                        title="Actualizar lista de proyectos"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {projects.length === 0 && (
                      <p className="px-3 py-3 text-xs text-zinc-500 dark:text-white/50">
                        No tiene proyectos asignados todavía.
                      </p>
                    )}

                    <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                      {projects.map((project) => {
                        const isSelected = project.id === activeProject?.id;
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleSelectProject(project)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-rose-500/10 text-zinc-900 dark:text-rose-200 font-semibold border border-rose-500/30 shadow-sm'
                                : 'text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="truncate flex-1 font-medium">{project.name}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-white/60 shrink-0 border border-zinc-200/60 dark:border-white/10">
                              {project.effectiveRole
                                ? labelFor(ROLE_LABELS, project.effectiveRole)
                                : labelFor(PROJECT_STATUS_LABELS, project.status)}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-white/10 mt-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          setShowProjectMenu(false);
                          onSelectTab('projects');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between"
                      >
                        <span>Gestionar proyectos</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {projectsError && (
              <span className="hidden lg:inline text-[10px] text-rose-600 dark:text-rose-300 truncate max-w-[240px]">
                {projectsError}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass-inset hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 transition-transform duration-200 hover:rotate-45" />
                  <span className="text-[11px] font-medium hidden sm:inline text-zinc-300">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-800 transition-transform duration-200 hover:-rotate-12" />
                  <span className="text-[11px] font-medium hidden sm:inline text-zinc-700">Oscuro</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu((value) => !value)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-inset hover:bg-black/5 dark:hover:bg-white/10 text-xs text-zinc-800 dark:text-white/80 font-medium transition-colors"
                title="Cuenta autenticada"
              >
                <UserCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" />
                <span className="font-mono text-[11px] font-semibold">
                  {labelFor(ROLE_LABELS, currentRole)}
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-white/50 rotate-90 ml-0.5" />
              </button>

              {showUserMenu && user && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0c0d14] rounded-2xl p-3 z-50 shadow-2xl border border-zinc-200 dark:border-rose-500/30 animate-in fade-in zoom-in-95 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-700 dark:text-white/80 border border-zinc-200 dark:border-white/10">
                        <UserCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {user.displayName}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-white/50 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black/30 border border-zinc-200/80 dark:border-white/10 text-[10px] text-zinc-600 dark:text-white/60 flex items-center justify-between">
                      <span>Rol efectivo</span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pr-1">{children}</main>
      </div>
    </div>
  );
};
