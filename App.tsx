// Fix: Implemented the main App component, setting up the layout, providers, and view-switching logic.
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProjectProvider, useProjectContext } from './hooks/useProjectContext';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import TaskList from './components/tasks/TaskList';
import ScheduleView from './components/schedule/ScheduleView';
import TeamManagementView from './components/team/TeamManagementView';
import ReportsView from './components/reports/ReportsView';
import FilesView from './components/files/FilesView';
import CommunicationView from './components/communication/CommunicationView';
import UserManagementView from './components/admin/UserManagementView';

const MainApp: React.FC = () => {
  const { loading: projectLoading, error: projectError } = useProjectContext();
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');

  if (projectLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-700">Carregando dados do projeto...</div>;
  }
  
  if (projectError) {
    return <div className="flex h-screen items-center justify-center bg-red-100 text-red-700 p-4 text-center">{projectError}</div>;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'Dashboard': return <Dashboard />;
      case 'Projetos': return <ProjectList />;
      case 'Tarefas': return <TaskList />;
      case 'Cronograma': return <ScheduleView />;
      case 'Equipe': return <TeamManagementView />;
      case 'Usuários': return <UserManagementView />;
      case 'Relatórios': return <ReportsView />;
      case 'Arquivos': return <FilesView />;
      case 'Chat': return <CommunicationView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeView={activeView} 
        setActiveView={setActiveView}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={activeView} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { session, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-700">Carregando sessão...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <MainApp />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
