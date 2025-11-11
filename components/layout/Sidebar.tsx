
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
} from '../ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSetView: (view: string) => void;
  setGlobalProjectFilter: (filter: string) => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  view: string;
  currentView: string;
  onSetView: (view: string) => void;
  onClose: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, view, currentView, onSetView, onClose }) => {
  const isActive = currentView === view;
  const linkClasses = `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
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
        <Icon className="mr-3 h-5 w-5" />
        <span>{label}</span>
      </a>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onSetView, setGlobalProjectFilter }) => {
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
    { icon: DocumentTextIcon, label: 'Arquivos', view: 'files' },
    { icon: FolderIcon, label: 'Relatórios', view: 'reports' },
    { icon: ChatBubbleIcon, label: 'Comunicação', view: 'communication' },
    { icon: EmailIcon, label: 'Histórico de Cobranças', view: 'notifications' },
  ];
  
  if (isGlobalAdmin) {
    navItems.push({ icon: CubeIcon, label: 'Admin', view: 'admin' });
  }

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
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:inset-auto lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b px-4">
          <span className="text-xl font-bold text-slate-800">ProjectHub</span>
          <button onClick={onClose} className="lg:hidden text-slate-500 p-1">
            <XIcon className="h-6 w-6"/>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <NavItem key={item.view} {...item} currentView={currentView} onSetView={handleSetView} onClose={onClose} />
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
