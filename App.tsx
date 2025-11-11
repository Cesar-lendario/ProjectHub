import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { ProjectProvider, useProjectContext } from './hooks/useProjectContext';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import TaskList from './components/tasks/TaskList';
import ScheduleView from './components/schedule/ScheduleView';
import TeamView from './components/team/TeamView';
import ReportsView from './components/reports/ReportsView';
import FilesView from './components/files/FilesView';
import CommunicationView from './components/communication/CommunicationView';
import UserProfileView from './components/team/UserProfileView';
import TeamForm from './components/team/TeamForm';
import { User } from './types';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [taskFilterProjectId, setTaskFilterProjectId] = useState<string | null>(null);
  const { loading, addUser, updateUser, deleteUser } = useProjectContext();

  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingUserForForm, setEditingUserForForm] = useState<User | null>(null);

  const handleOpenTeamForm = (user: User | null) => {
    setEditingUserForForm(user);
    setIsTeamFormOpen(true);
  };

  const handleCloseTeamForm = () => {
    setEditingUserForForm(null);
    setIsTeamFormOpen(false);
  };

  const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
    if ('id' in userData) {
      await updateUser(userData);
    } else {
      await addUser(userData);
    }
    handleCloseTeamForm();
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este membro da equipe? Ele será removido de todos os projetos e tarefas.')) {
        deleteUser(userId);
    }
  }
  
  const handleDeleteUserAndNav = (userId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este membro da equipe? Ele será removido de todos os projetos e tarefas.')) {
        deleteUser(userId);
        setActiveView('Equipe');
        setViewingUser(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-slate-700">Carregando ProjectHub...</h2>
          <p className="mt-2 text-slate-500">Conectando ao banco de dados. Aguarde um momento.</p>
        </div>
      </div>
    );
  }

  const handleViewProfile = (user: User) => {
    setViewingUser(user);
    setActiveView('Perfil do Usuário');
  };

  const handleNavigateToTasks = (projectId: string) => {
    setTaskFilterProjectId(projectId);
    setActiveView('Tarefas');
  };
  
  const handleViewChange = (view: string) => {
    if (view !== 'Tarefas') {
      setTaskFilterProjectId(null);
    }
    if (view !== 'Perfil do Usuário') {
      setViewingUser(null);
    }
    setActiveView(view);
  }


  const renderActiveView = () => {
    switch (activeView) {
      case 'Projetos':
        return <ProjectList onNavigateToTasks={handleNavigateToTasks} />;
      case 'Tarefas':
        return <TaskList initialProjectFilter={taskFilterProjectId} />;
      case 'Cronograma':
        return <ScheduleView />;
      case 'Equipe':
        return <TeamView onViewProfile={handleViewProfile} onAddUser={() => handleOpenTeamForm(null)} onEditUser={handleOpenTeamForm} onDeleteUser={handleDeleteUser} />;
      case 'Perfil do Usuário':
        return viewingUser ? <UserProfileView user={viewingUser} onEdit={handleOpenTeamForm} onDelete={handleDeleteUserAndNav} /> : <TeamView onViewProfile={handleViewProfile} onAddUser={() => handleOpenTeamForm(null)} onEditUser={handleOpenTeamForm} onDeleteUser={handleDeleteUser} />;
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
    <div className="flex h-screen bg-slate-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={handleViewChange} 
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={activeView} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
       <TeamForm
        isOpen={isTeamFormOpen}
        onClose={handleCloseTeamForm}
        onSave={handleSaveUser}
        userToEdit={editingUserForForm}
      />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;