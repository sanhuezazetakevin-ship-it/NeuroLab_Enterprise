import React, { useState } from 'react';
import { Activity, Network } from 'lucide-react';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { AppProvider, useApp } from '../lib/AppContext';
import { Shell, NavTab } from '../components/layout/Shell';
import { ToastContainer } from '../components/common/ToastContainer';
import { WalkthroughModal } from '../components/common/WalkthroughModal';
import { LoginView } from '../features/auth/LoginView';

// Feature Views
import { DashboardView } from '../features/dashboard/DashboardView';
import { ProjectsView } from '../features/projects/ProjectsView';
import { FundamentalsView } from '../features/fundamentals/FundamentalsView';
import { ArchitectureDesignerView } from '../features/architectures/ArchitectureDesignerView';
import { DatasetsView } from '../features/datasets/DatasetsView';
import { TrainingManagerView } from '../features/training/TrainingManagerView';
import { EvaluationView } from '../features/evaluation/EvaluationView';
import { ModelRegistryView } from '../features/model-registry/ModelRegistryView';
import { ReportsView } from '../features/reports/ReportsView';
import { AdministrationView } from '../features/administration/AdministrationView';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen w-full flex items-center justify-center p-6">
    <div className="glass-panel rounded-3xl px-8 py-7 flex items-center gap-4 shadow-glass">
      <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 flex items-center justify-center text-zinc-900 dark:text-white">
        <Network className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          NeuroLab Enterprise <Activity className="w-3.5 h-3.5 animate-pulse" />
        </p>
        <p className="text-[11px] text-zinc-500 dark:text-white/50">
          Verificando sesión y cargando espacio de trabajo…
        </p>
      </div>
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { activeProject, setActiveProject } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <Shell currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
      {currentTab === 'projects' && <ProjectsView />}
      {currentTab === 'fundamentals' && <FundamentalsView />}
      {currentTab === 'architectures' && <ArchitectureDesignerView />}
      {currentTab === 'datasets' && <DatasetsView />}
      {currentTab === 'training' && <TrainingManagerView />}
      {currentTab === 'evaluation' && <EvaluationView />}
      {currentTab === 'model-registry' && <ModelRegistryView />}
      {currentTab === 'reports' && <ReportsView />}
      {currentTab === 'administration' && <AdministrationView />}

      {/* Global Overlays */}
      <WalkthroughModal onNavigateTab={setCurrentTab} />
      <ToastContainer />
      {activeProject && <span className="sr-only">Proyecto activo: {activeProject.name}</span>}
      {!activeProject && (
        <span className="sr-only">
          Sin proyecto activo. Cree un proyecto o solicite acceso para comenzar.
        </span>
      )}
    </Shell>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginView />;

  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
