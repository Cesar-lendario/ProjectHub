import React, { useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { User, TaskStatus, TaskPriority } from '../../types';
import Card from '../ui/Card';
import { TasksIcon, CheckSquareIcon, AlertCircleIcon, EditIcon, TrashIcon } from '../ui/Icons';

interface UserProfileViewProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

const getPriorityChip = (priority: TaskPriority) => {
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    switch (priority) {
        case TaskPriority.High: return `${baseClasses} bg-red-100 text-red-800`;
        case TaskPriority.Medium: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case TaskPriority.Low: return `${baseClasses} bg-blue-100 text-blue-800`;
    }
}

const getStatusChip = (status: TaskStatus) => {
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    switch (status) {
        case TaskStatus.Pending: return `${baseClasses} bg-purple-100 text-purple-800`;
        case TaskStatus.ToDo: return `${baseClasses} bg-slate-200 text-slate-800`;
        case TaskStatus.InProgress: return `${baseClasses} bg-orange-200 text-orange-800`;
        case TaskStatus.Done: return `${baseClasses} bg-green-200 text-green-800`;
    }
}

const StatItem: React.FC<{ icon: React.ElementType; value: number; label: string; iconClasses: string }> = ({ icon: Icon, value, label, iconClasses }) => (
    <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full ${iconClasses.split(' ')[0]}`}>
            <Icon className={`h-5 w-5 ${iconClasses.split(' ')[1]}`} />
        </div>
        <div>
            <span className="text-xl font-bold text-slate-800 mr-2">{value}</span>
            <span className="text-slate-500">{label}</span>
        </div>
    </div>
);

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onEdit, onDelete, isAdmin }) => {
  const { projects } = useProjectContext();

  const userTasks = useMemo(() => {
    return projects.flatMap(p => 
        p.tasks
            .filter(t => t.assignee?.id === user.id)
            .map(t => ({ ...t, projectName: p.name }))
    );
  }, [projects, user.id]);

  const stats = useMemo(() => {
    const completed = userTasks.filter(t => t.status === TaskStatus.Done).length;
    const overdue = userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
    return {
        total: userTasks.length,
        completed,
        overdue,
    };
  }, [userTasks]);
  
  return (
    <div className="space-y-6">
      <Card className="relative p-6">
        {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={() => onEdit(user)}
                    title="Editar Membro"
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full transition-colors text-slate-500 hover:bg-slate-200 hover:text-indigo-600"
                >
                    <EditIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDelete(user.id)}
                    title="Excluir Membro"
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full transition-colors text-slate-500 hover:bg-red-100 hover:text-red-600"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        )}
        
        <div className="flex flex-col items-center text-center">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
            <h1 className="text-3xl font-bold text-slate-900 mt-4">{user.name}</h1>
            <p className="text-indigo-600 font-semibold">{user.function || 'Membro da Equipe'}</p>
        </div>
        
        <div className="mt-8 space-y-5 max-w-xs mx-auto">
            <StatItem icon={TasksIcon} value={stats.total} label="Tarefas Atribuídas" iconClasses="bg-blue-100 text-blue-600" />
            <StatItem icon={CheckSquareIcon} value={stats.completed} label="Tarefas Concluídas" iconClasses="bg-green-500 text-white" />
            <StatItem icon={AlertCircleIcon} value={stats.overdue} label="Tarefas Atrasadas" iconClasses="bg-red-500 text-white" />
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Tarefas Atribuídas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarefa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Projeto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vencimento</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {userTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.projectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getPriorityChip(task.priority)}>{task.priority}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusChip(task.status)}>{task.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {userTasks.length === 0 && <p className="text-center py-8 text-slate-500">Nenhuma tarefa atribuída a este usuário.</p>}
        </div>
      </Card>
    </div>
  );
};

export default UserProfileView;