import React, { useMemo, useState } from 'react';
import {
  FolderGit2,
  Plus,
  Layers,
  CheckCircle2,
  Search,
  X,
  RefreshCw,
  Database,
  PlayCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { ApiClient } from '../../lib/api';
import { Project } from '../../types';
import { formatDate } from '../../lib/format';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    projectsLoading,
    projectsError,
    activeProject,
    setActiveProject,
    refreshProjects,
    showToast,
    currentRole,
  } = useApp();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const canCreate = ['ADMIN', 'PROJECT_LEAD', 'AI_ENGINEER'].includes(currentRole);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        (project.description || '').toLowerCase().includes(term),
    );
  }, [projects, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };

  const handleCreateProject = async () => {
    if (!name.trim()) {
      setCreateError('El nombre del proyecto es obligatorio');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await ApiClient.createProject(name.trim(), description.trim() || undefined);
      const list = await refreshProjects();
      const resolved = list.find((project) => project.id === created.id) || created;
      setActiveProject(resolved as Project);
      setShowCreateModal(false);
      setName('');
      setDescription('');
      showToast(`Proyecto "${resolved.name}" creado`, 'success');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'No fue posible crear el proyecto');
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (project: Project) => {
    setActiveProject(project);
    showToast(`Proyecto activo: ${project.name}`, 'info');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4 text-zinc-700 dark:text-white/80" /> Módulo 02 • Proyectos
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Espacios de Trabajo
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50 mt-0.5">
            Proyectos aislados con control de acceso por rol, datasets, arquitecturas y modelos asociados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-btn-secondary text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            disabled={!canCreate}
            title={canCreate ? undefined : 'Su rol no permite crear proyectos'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold ${
              canCreate ? 'glass-btn-primary' : 'glass-btn-secondary opacity-40 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" /> Crear Proyecto
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proyectos…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3 py-2 text-xs"
          />
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-white/45">
          {projects.length} proyecto(s) accesibles · rol global{' '}
          <strong className="font-mono text-zinc-800 dark:text-white/80">{currentRole}</strong>
        </span>
      </div>

      {projectsLoading && (
        <div className="glass-card rounded-2xl p-8 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-white/60 min-h-[180px]">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando proyectos…
        </div>
      )}

      {!projectsLoading && projectsError && (
        <div className="glass-card rounded-2xl p-6 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-300 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {projectsError}
          </span>
          <button onClick={handleRefresh} className="px-3 py-1.5 rounded-xl glass-btn-secondary text-xs">
            Reintentar
          </button>
        </div>
      )}

      {!projectsLoading && !projectsError && filteredProjects.length === 0 && (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center gap-2">
          <FolderGit2 className="w-6 h-6 text-zinc-400 dark:text-white/40" />
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            {projects.length === 0 ? 'Aún no hay proyectos' : 'Sin resultados'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-white/50 max-w-md">
            {projects.length === 0
              ? 'Cree su primer proyecto para cargar datasets, diseñar arquitecturas y entrenar modelos.'
              : 'Pruebe con otro término de búsqueda.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProject?.id;
          return (
            <div
              key={project.id}
              onClick={() => handleSelect(project)}
              className={`glass-card p-5 rounded-2xl glass-card-hover cursor-pointer space-y-3 flex flex-col justify-between ${
                isActive
                  ? 'border-zinc-900/30 dark:border-white/30 bg-black/5 dark:bg-white/15 ring-1 ring-zinc-900/20 dark:ring-white/20'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-inset text-zinc-700 dark:text-white/70 border border-black/10 dark:border-white/10">
                    {project.effectiveRole || project.status}
                  </span>
                  {isActive ? (
                    <span className="text-xs text-zinc-900 dark:text-white font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 dark:text-white/40">{formatDate(project.createdAt)}</span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{project.name}</h3>
                <p className="text-xs text-zinc-600 dark:text-white/50 mt-1 leading-relaxed line-clamp-2">
                  {project.description || 'Sin descripción.'}
                </p>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 grid grid-cols-3 gap-2 text-[11px] text-zinc-500 dark:text-white/50">
                <span className="flex items-center gap-1" title="Arquitecturas">
                  <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" /> {project.architecturesCount}
                </span>
                <span className="flex items-center gap-1" title="Datasets">
                  <Database className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" /> {project.datasetsCount}
                </span>
                <span className="flex items-center gap-1" title="Trabajos de entrenamiento">
                  <PlayCircle className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" /> {project.jobsCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel border border-black/15 dark:border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Nuevo Proyecto</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                placeholder="ej. Detección de fraude transaccional"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">
                Descripción
              </label>
              <textarea
                placeholder="Objetivo del modelo, dominio y criterios de aceptación…"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {createError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-300 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {createError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-2 text-xs text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creating}
                className="px-4 py-2 glass-btn-primary text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Guardar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
