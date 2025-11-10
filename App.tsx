import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { ProjectProvider } from './hooks/useProjectContext';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import TaskList from './components/tasks/TaskList';
import ScheduleView from './components/schedule/ScheduleView';
import TeamView from './components/team/TeamView';
import ReportsView from './components/reports/ReportsView';
import FilesView from './components/files/FilesView';
import CommunicationView from './components/communication/CommunicationView';
import UserProfileView from './components/team/UserProfileView';
import { User } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const handleViewProfile = (user: User) => {
    setViewingUser(user);
    setActiveView('Perfil do Usuário');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'Projetos':
        return <ProjectList />;
      case 'Tarefas':
        return <TaskList />;
      case 'Cronograma':
        return <ScheduleView />;
      case 'Equipe':
        return <TeamView onViewProfile={handleViewProfile} />;
      case 'Perfil do Usuário':
        return viewingUser ? <UserProfileView user={viewingUser} /> : <TeamView onViewProfile={handleViewProfile} />;
      case 'Relatórios':
        return <ReportsView />;
       case 'Arquivos':
        return <FilesView />;
       case 'Chat':
        return <CommunicationView />;
      case 'Dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProjectProvider>
      <div className="flex h-screen bg-slate-100">
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
    </ProjectProvider>
  );
};

export default App;