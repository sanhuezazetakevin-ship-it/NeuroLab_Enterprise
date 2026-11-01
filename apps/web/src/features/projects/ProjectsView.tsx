import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Layers,
  CheckCircle2,
  Search
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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" /> Módulo 02 • Proyectos
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Espacios de Trabajo & Model Repositories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Espacios aislados con trazabilidad de versiones, control de acceso y modelos asociados.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Crear Proyecto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filteredProjects.length} proyectos</span>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => {
          const isActive = p.id === activeProject.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-blue-500/70 ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{p.name}</h3>
                  {isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-center">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Topologías</span>
                  <span className="text-slate-800 dark:text-white font-bold font-mono text-xs">{p.architecturesCount || 1}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Datasets</span>
                  <span className="text-slate-800 dark:text-white font-bold font-mono text-xs">{p.datasetsCount || 1}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 text-[9px] uppercase font-bold block">Jobs</span>
                  <span className="text-slate-800 dark:text-white font-bold font-mono text-xs">{p.jobsCount || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 max-w-md w-full space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Crear Proyecto
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="ej. Segmentación Predictiva Churn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
              <textarea
                placeholder="Objetivo empresarial y variables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-xs text-slate-800 dark:text-white h-20 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
