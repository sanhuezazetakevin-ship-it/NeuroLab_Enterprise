import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Project, Architecture, Dataset, TrainingJob, ModelVersion } from '../types';
import { DEMO_SCENARIOS, DemoScenario } from './demoData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  activeScenarioId: string;
  activeScenario: DemoScenario;
  switchScenario: (scenarioId: string) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  walkthroughOpen: boolean;
  setWalkthroughOpen: (open: boolean) => void;
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  allProjects: Project[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('fintech');
  const [currentRole, setCurrentRole] = useState<UserRole>('AI_ENGINEER');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [walkthroughOpen, setWalkthroughOpen] = useState<boolean>(false);

  const activeScenario = DEMO_SCENARIOS[activeScenarioId] || DEMO_SCENARIOS.fintech;

  const [activeProject, setActiveProject] = useState<Project>(activeScenario.project);

  const allProjects: Project[] = Object.values(DEMO_SCENARIOS).map((s) => s.project);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchScenario = (scenarioId: string) => {
    if (DEMO_SCENARIOS[scenarioId]) {
      setActiveScenarioId(scenarioId);
      setActiveProject(DEMO_SCENARIOS[scenarioId].project);
      showToast(`Escenario cargado: ${DEMO_SCENARIOS[scenarioId].title}`, 'info');
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    showToast(`Perspectiva RBAC cambiada a: ${role}`, 'info');
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      showToast(next ? 'Modo Demostración Activado' : 'Modo Demostración Desactivado', next ? 'success' : 'warning');
      return next;
    });
  };

  // Sync active scenario project changes
  useEffect(() => {
    if (DEMO_SCENARIOS[activeScenarioId]) {
      setActiveProject(DEMO_SCENARIOS[activeScenarioId].project);
    }
  }, [activeScenarioId]);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        activeScenarioId,
        activeScenario,
        switchScenario,
        currentRole,
        switchRole,
        toasts,
        showToast,
        removeToast,
        walkthroughOpen,
        setWalkthroughOpen,
        activeProject,
        setActiveProject,
        allProjects,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
