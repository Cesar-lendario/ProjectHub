import React from 'react';
import { User } from '../../types';
import Card from '../ui/Card';
import { TasksIcon, CheckSquareIcon, AlertCircleIcon, EditIcon, TrashIcon } from '../ui/Icons';

interface TeamMemberCardProps {
  user: User;
  stats: {
    total: number;
    completed: number;
    overdue: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  isAdmin: boolean;
}

const StatItem: React.FC<{ icon: React.ElementType, value: number, label: string, colorClass: string }> = ({ icon: Icon, value, label, colorClass }) => (
    <div className="flex items-center text-left">
        <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full mr-3 ${colorClass}`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <p className="font-bold text-slate-900 dark:text-slate-50 text-xl">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ user, stats, onEdit, onDelete, onView, isAdmin }) => {
  return (
    <Card 
        className="transition-shadow relative border border-slate-200 hover:shadow-xl hover:border-indigo-400"
    >
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                  onClick={onEdit}
                  title="Editar Membro"
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
              >
                  <EditIcon className="h-4 w-4" />
              </button>
              <button
                  onClick={onDelete}
                  title="Excluir Membro"
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600"
              >
                  <TrashIcon className="h-4 w-4" />
              </button>
        </div>
      )}
      
      <div onClick={onView} className="flex flex-col items-center p-4 text-center cursor-pointer">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md mt-8"
        />
        <h3 className="mt-4 font-bold text-xl text-slate-800 dark:text-slate-50">{user.name}</h3>
        <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
          {user.role}
        </span>

        <div className="mt-6 w-full space-y-4">
          <StatItem icon={TasksIcon} value={stats.total} label="Tarefas Atribuídas" colorClass="bg-blue-500" />
          <StatItem icon={CheckSquareIcon} value={stats.completed} label="Tarefas Concluídas" colorClass="bg-green-500" />
          <StatItem icon={AlertCircleIcon} value={stats.overdue} label="Tarefas Atrasadas" colorClass="bg-red-500" />
        </div>
      </div>
    </Card>
  );
};

export default TeamMemberCard;