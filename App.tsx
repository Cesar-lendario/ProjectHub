
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
const ChecklistView = lazy(() => import('./components/tasks/ChecklistView'));
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
  const { session, loading, signOut } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  console.log('[AppContent] 🔍 Render - loading:', loading, 'session:', !!session);
  
  // Timeout de segurança: se loading demorar mais de 15 segundos, mostrar erro
  React.useEffect(() => {
    if (loading) {
      console.log('[AppContent] ⏳ Loading iniciado, configurando timeout de 15s...');
      const timeout = setTimeout(() => {
        console.error('[AppContent] ⚠️ Timeout: Loading demorou mais de 15 segundos');
        setLoadingTimeout(true);
      }, 15000);
      
      return () => {
        console.log('[AppContent] ✅ Loading finalizado antes do timeout');
        clearTimeout(timeout);
      };
    } else {
      console.log('[AppContent] ℹ️ Loading=false, limpando timeout');
      setLoadingTimeout(false);
    }
  }, [loading]);
  
  // Verificar se há um token de convite na URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasInvite = urlParams.has('invite');
  
  // Se há um convite e está logado, fazer logout automático
  React.useEffect(() => {
    if (hasInvite && session) {
      console.log('Convite detectado com sessão ativa. Fazendo logout...');
      signOut();
    }
  }, [hasInvite, session, signOut]);
  
  if (loading || loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-700 dark:text-slate-200">Carregando...</p>
          {loadingTimeout && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Carregamento está demorando mais que o esperado.
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-2">
                Verifique sua conexão ou recarregue a página (Ctrl+Shift+R)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Forçar LoginPage se há convite na URL ou não há sessão
  if (!session || hasInvite) {
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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setFocusedUserId } = useProjectContext();
  const { profile } = useAuth();
  
  const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    tasks: 'Tarefas',
    checklist: 'Lista de Verificação',
    team: 'Equipe',
    files: 'Arquivos',
    communication: 'Comunicação',
    admin: 'Admin - Usuários',
    permissions: 'Configurações',
    notifications: 'Histórico de Cobranças',
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          onNavigateToProjects={() => setCurrentView('projects')} 
          onNavigateToTasks={() => setCurrentView('tasks')}
          onNavigateToTasksWithProject={(projectId: string) => {
            setGlobalProjectFilter(projectId);
            setCurrentView('tasks');
          }}
        />
      );
      case 'projects': return <ProjectList setCurrentView={setCurrentView} setGlobalProjectFilter={setGlobalProjectFilter} />;
      case 'tasks': return <TaskList globalProjectFilter={globalProjectFilter} setGlobalProjectFilter={setGlobalProjectFilter} />;
      case 'checklist': return <ChecklistView globalProjectFilter={globalProjectFilter} setGlobalProjectFilter={setGlobalProjectFilter} />;
      case 'team': return <TeamManagementView />;
      case 'files': return <FilesView />;
      case 'communication': return <CommunicationView />;
      case 'admin': return <UserManagementView />;
      case 'permissions': return <PermissionSettingsView />;
      case 'notifications': return <NotificationLogTable setCurrentView={setCurrentView} setGlobalProjectFilter={setGlobalProjectFilter} />;
      default: return (
        <Dashboard 
          onNavigateToProjects={() => setCurrentView('projects')} 
          onNavigateToTasks={() => setCurrentView('tasks')}
          onNavigateToTasksWithProject={(projectId: string) => {
            setGlobalProjectFilter(projectId);
            setCurrentView('tasks');
          }}
        />
      );
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

  const handleGoToCommunication = () => {
    setCurrentView('communication');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentView={currentView}
        onSetView={setCurrentView}
        setGlobalProjectFilter={setGlobalProjectFilter}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title={viewTitles[currentView] || 'TaskMeet'} 
          onMenuClick={() => setSidebarOpen(true)} 
          onGoToProfile={handleGoToProfile}
          onGoToSettings={handleGoToSettings}
          onGoToCommunication={handleGoToCommunication}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-transparent transition-colors">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-300">Carregando...</div>}>
            {renderView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
