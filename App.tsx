
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProjectProvider } from './hooks/useProjectContext';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import TaskList from './components/tasks/TaskList';
import ScheduleView from './components/schedule/ScheduleView';
import ReportsView from './components/reports/ReportsView';
import FilesView from './components/files/FilesView';
import CommunicationView from './components/communication/CommunicationView';
import TeamManagementView from './components/team/TeamManagementView';
import UserManagementView from './components/admin/UserManagementView';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }
  
  return <MainApp />;
};

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [globalProjectFilter, setGlobalProjectFilter] = useState<string>('all');

  return (
    <MainLayout 
      currentView={currentView}
      setCurrentView={setCurrentView}
      globalProjectFilter={globalProjectFilter}
      setGlobalProjectFilter={setGlobalProjectFilter}
    />
  );
}

interface MainLayoutProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  globalProjectFilter: string;
  setGlobalProjectFilter: (filter: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentView, setCurrentView, globalProjectFilter, setGlobalProjectFilter }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    projects: 'Projetos',
    tasks: 'Tarefas',
    schedule: 'Cronograma',
    team: 'Equipe',
    files: 'Arquivos',
    reports: 'Relatórios',
    communication: 'Comunicação',
    admin: 'Admin',
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <ProjectList setCurrentView={setCurrentView} setGlobalProjectFilter={setGlobalProjectFilter} />;
      case 'tasks': return <TaskList globalProjectFilter={globalProjectFilter} setGlobalProjectFilter={setGlobalProjectFilter} />;
      case 'schedule': return <ScheduleView />;
      case 'team': return <TeamManagementView />;
      case 'files': return <FilesView />;
      case 'reports': return <ReportsView />;
      case 'communication': return <CommunicationView />;
      case 'admin': return <UserManagementView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentView={currentView}
        onSetView={setCurrentView}
        setGlobalProjectFilter={setGlobalProjectFilter}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title={viewTitles[currentView]} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;