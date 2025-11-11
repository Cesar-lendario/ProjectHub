
import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { ProjectProvider, useProjectContext } from './hooks/useProjectContext';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const ProjectList = lazy(() => import('./components/projects/ProjectList'));
const TaskList = lazy(() => import('./components/tasks/TaskList'));
const ScheduleView = lazy(() => import('./components/schedule/ScheduleView'));
const ReportsView = lazy(() => import('./components/reports/ReportsView'));
const FilesView = lazy(() => import('./components/files/FilesView'));
const CommunicationView = lazy(() => import('./components/communication/CommunicationView'));
const TeamManagementView = lazy(() => import('./components/team/TeamManagementView'));
const UserManagementView = lazy(() => import('./components/admin/UserManagementView'));
const NotificationLogTable = lazy(() => import('./components/tasks/NotificationLogTable'));
const PermissionSettingsView = lazy(() => import('./components/admin/PermissionSettingsView'));

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

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
  
  return (
    <ProjectProvider>
      <MainApp />
    </ProjectProvider>
  );
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
  const { setFocusedUserId } = useProjectContext();
  const { profile } = useAuth();
  
  const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    projects: 'Projetos',
    tasks: 'Tarefas',
    schedule: 'Cronograma',
    team: 'Equipe',
    files: 'Arquivos',
    reports: 'Relatórios',
    communication: 'Comunicação',
    admin: 'Admin - Usuários',
    permissions: 'Configurações',
    notifications: 'Histórico de Cobranças',
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
      case 'permissions': return <PermissionSettingsView />;
      case 'notifications': return <NotificationLogTable />;
      default: return <Dashboard />;
    }
  };

  const handleGoToProfile = () => {
    if (profile?.id) {
      setFocusedUserId(profile.id);
    }
    setCurrentView('team');
  };

  const handleGoToSettings = () => {
    setCurrentView('permissions');
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
          title={viewTitles[currentView] || 'ProjectHub'} 
          onMenuClick={() => setSidebarOpen(true)} 
          onGoToProfile={handleGoToProfile}
          onGoToSettings={handleGoToSettings}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Carregando...</div>}>
            {renderView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
