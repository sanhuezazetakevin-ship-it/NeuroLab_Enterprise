import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Layers,
  CheckCircle2,
  Search,
  X
} from 'lucide-react';
import { Project } from '../../types';
import { useDemo } from '../../lib/DemoContext';
import { DEMO_SCENARIOS } from '../../lib/demoData';

interface ProjectsViewProps {
  onSelectProject: (p: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
  const { allProjects, activeProject, setActiveProject, switchScenario, showToast } = useDemo();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [projectList, setProjectList] = useState<Project[]>(allProjects);

  const filteredProjects = projectList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateProject = () => {
    if (!name) return;
    const newProj: Project = {
      id: Math.random().toString(),
      name: name,
      description: description || 'Proyecto de Red Neuronal Artificial',
      ownerId: 'c138d879-112e-4b44-b0db-6e1d283626fa',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      architecturesCount: 1,
      datasetsCount: 1,
      jobsCount: 0
    };
    setProjectList([newProj, ...projectList]);
    setActiveProject(newProj);
    setShowCreateModal(false);
    setName('');
    setDescription('');
    showToast(`Proyecto "${newProj.name}" creado con éxito`, 'success');
  };

  const handleSelect = (p: Project) => {
    setActiveProject(p);
    const matchingScenario = Object.values(DEMO_SCENARIOS).find((s) => s.project.id === p.id);
    if (matchingScenario) {
      switchScenario(matchingScenario.id);
    } else {
      showToast(`Proyecto activo cambiado a: ${p.name}`, 'info');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4 text-zinc-700 dark:text-white/80" /> Módulo 02 • Proyectos
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-1">
            Espacios de Trabajo & Model Repositories
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50 mt-0.5">
            Espacios aislados con trazabilidad de versiones, control de acceso y modelos asociados.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-btn-primary text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> Crear Proyecto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredProjects.map((proj) => {
          const isActive = proj.id === activeProject.id;
          return (
            <div
              key={proj.id}
              onClick={() => handleSelect(proj)}
              className={`glass-card p-5 rounded-2xl glass-card-hover cursor-pointer space-y-3 flex flex-col justify-between ${
                isActive ? 'border-zinc-900/30 dark:border-white/30 bg-black/5 dark:bg-white/15 ring-1 ring-zinc-900/20 dark:ring-white/20' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full glass-inset text-zinc-700 dark:text-white/70 border border-black/10 dark:border-white/10">
                    {proj.status}
                  </span>
                  {isActive && (
                    <span className="text-xs text-zinc-900 dark:text-white font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{proj.name}</h3>
                <p className="text-xs text-zinc-600 dark:text-white/50 mt-1 leading-relaxed line-clamp-2">
                  {proj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-white/50">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-white/60" /> {proj.architecturesCount} Arquitectura
                </span>
                <span>{proj.datasetsCount} Dataset</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel border border-black/15 dark:border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-glass animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Nuevo Proyecto de Red Neuronal</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">Nombre del Proyecto</label>
              <input
                type="text"
                placeholder="ej. Detección de Arritmias Cardíacas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-white/60 mb-1.5">Descripción</label>
              <textarea
                placeholder="Objetivo del modelo, dominio de aplicación y especificaciones..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-2 text-xs text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 glass-btn-primary text-xs font-semibold rounded-xl"
              >
                Guardar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
