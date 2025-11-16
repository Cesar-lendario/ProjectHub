
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GlobalRole } from '../../types';
import {
  ChartBarIcon,
  FolderIcon,
  CheckSquareIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleIcon,
  CubeIcon,
  XIcon,
  EmailIcon,
  CogIcon,
} from '../ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSetView: (view: string) => void;
  setGlobalProjectFilter: (filter: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  view: string;
  currentView: string;
  onSetView: (view: string) => void;
  onClose: () => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, view, currentView, onSetView, onClose, isCollapsed }) => {
  const isActive = currentView === view;
  const linkClasses = `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} rounded-lg py-2.5 text-sm font-medium transition-all ${
    isActive 
      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md dark:shadow-indigo-500/30' 
      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
  }`;

  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSetView(view);
          onClose();
        }}
        className={linkClasses}
      >
        <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
        {!isCollapsed && <span>{label}</span>}
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onSetView, setGlobalProjectFilter, isCollapsed, onToggleCollapse }) => {
  const { profile } = useAuth();
  const isGlobalAdmin = profile?.role === GlobalRole.Admin;

  const handleSetView = (view: string) => {
    if (view === 'tasks') {
      setGlobalProjectFilter('all');
    }
    onSetView(view);
  };

  const navItems = [
    { icon: ChartBarIcon, label: 'Dashboard', view: 'dashboard' },
    { icon: FolderIcon, label: 'Projetos', view: 'projects' },
    { icon: CheckSquareIcon, label: 'Tarefas', view: 'tasks' },
    { icon: CalendarDaysIcon, label: 'Cronograma', view: 'schedule' },
    { icon: UsersIcon, label: 'Equipe', view: 'team' },
    { icon: ChatBubbleIcon, label: 'Comunicação', view: 'communication' },
    { icon: DocumentTextIcon, label: 'Arquivos', view: 'files' },
    { icon: FolderIcon, label: 'Relatórios', view: 'reports' },
    { icon: EmailIcon, label: 'Histórico de Cobranças', view: 'notifications' },
  ];
  
  if (isGlobalAdmin) {
    navItems.push({ icon: CubeIcon, label: 'Admin - Usuários', view: 'admin' });
  }

  navItems.push({ icon: CogIcon, label: 'Configurações', view: 'permissions' });

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Expand Button - only visible when collapsed on desktop */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex fixed left-[88px] top-20 z-50 items-center justify-center h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:scale-110 animate-pulse hover:animate-none"
          title="Expandir menu lateral"
          aria-label="Expandir menu lateral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} transform flex-col border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/95 backdrop-blur-md transition-all lg:static lg:inset-auto lg:z-auto lg:translate-x-0 shadow-sm dark:shadow-black/20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700/50 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <span className={`text-xl font-bold text-slate-800 dark:text-slate-50 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
            ProjectHub
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-lg transition-all ${
                isCollapsed 
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/60' 
                  : 'text-slate-500 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
              title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          <button onClick={onClose} className="lg:hidden text-slate-500 dark:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-colors">
            <XIcon className="h-6 w-6"/>
          </button>
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
          <ul className={isCollapsed ? 'space-y-2' : 'space-y-1'}>
            {navItems.map(item => (
              <NavItem
                key={item.view}
                {...item}
                currentView={currentView}
                onSetView={handleSetView}
                onClose={onClose}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
