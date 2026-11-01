import React, { useState } from 'react';
import { DemoProvider, useDemo } from '../lib/DemoContext';
import { Shell, NavTab } from '../components/layout/Shell';
import { ToastContainer } from '../components/common/ToastContainer';
import { WalkthroughModal } from '../components/common/WalkthroughModal';

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

const MainAppContent: React.FC = () => {
  const { activeProject, setActiveProject, allProjects } = useDemo();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <Shell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      activeProject={activeProject}
      onSelectProject={setActiveProject}
      projects={allProjects}
    >
      {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
      {currentTab === 'projects' && <ProjectsView onSelectProject={setActiveProject} />}
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
    </Shell>
  );
};

export const App: React.FC = () => {
  return (
    <DemoProvider>
      <MainAppContent />
    </DemoProvider>
  );
};

export default App;
