import React from 'react';
import { FolderIcon, CheckSquareIcon, UsersIcon, CalendarDaysIcon, ChartBarIcon, DocumentTextIcon, XIcon, ChatBubbleIcon } from '../ui/Icons';
import { useProjectContext } from '../../hooks/useProjectContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; isActive: boolean; onClick: () => void; hasNotification?: boolean; }> = ({ icon: Icon, label, isActive, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-700 hover:text-white'}`}
  >
    <Icon className="h-5 w-5 mr-3" />
    <span>{label}</span>
    {hasNotification && (
        <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeView, setActiveView }) => {
  const { messages, markAllMessagesAsRead } = useProjectContext();

  const hasUnreadMessages = messages.some(m => !m.isRead);

  const navItems = [
    { label: 'Dashboard', icon: ChartBarIcon },
    { label: 'Projetos', icon: FolderIcon },
    { label: 'Tarefas', icon: CheckSquareIcon },
    { label: 'Cronograma', icon: CalendarDaysIcon },
    { label: 'Equipe', icon: UsersIcon },
    { label: 'Chat', icon: ChatBubbleIcon },
    { label: 'Relatórios', icon: DocumentTextIcon },
    { label: 'Arquivos', icon: FolderIcon }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-20 bg-black/60 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      
      <div className={`fixed lg:relative inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 text-white p-4 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <span className="text-2xl font-bold">ProjectHub</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-300 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.label}
              hasNotification={item.label === 'Chat' && hasUnreadMessages}
              onClick={() => {
                setActiveView(item.label);
                if (item.label === 'Chat') {
                    markAllMessagesAsRead();
                }
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;