import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles
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
    // Find scenario if matches
    const matchingScenario = Object.values(DEMO_SCENARIOS).find((s) => s.project.id === p.id);
    if (matchingScenario) {
      switchScenario(matchingScenario.id);
    } else {
      showToast(`Proyecto activo cambiado a: ${p.name}`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" /> Módulo 02 • Proyectos de Inteligencia Artificial
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Espacios de Trabajo & Repositorios de Modelos</h1>
          <p className="text-xs text-slate-300 mt-1">
            Espacios colaborativos por problema de negocio con control de acceso RBAC y versionado independiente.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Crear Nuevo Proyecto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">Mostrando {filteredProjects.length} proyectos</span>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const isActive = p.id === activeProject.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug">{p.name}</h3>
                  {isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-slate-800/80 text-xs text-center">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Arquitecturas</span>
                  <span className="text-white font-bold font-mono text-sm">{p.architecturesCount || 1}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Datasets</span>
                  <span className="text-white font-bold font-mono text-sm">{p.datasetsCount || 1}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Trabajos</span>
                  <span className="text-white font-bold font-mono text-sm">{p.jobsCount || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Crear Nuevo Proyecto de Red Neuronal
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Proyecto</label>
              <input
                type="text"
                placeholder="ej. Detección de Fraude en Transacciones"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción del Problema</label>
              <textarea
                placeholder="Define el objetivo empresarial, las entradas esperadas y el tipo de predicción..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white h-24 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Crear Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
