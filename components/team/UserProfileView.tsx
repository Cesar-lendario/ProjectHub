import React, { useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { User, Task, TaskStatus, TaskPriority } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { TasksIcon, CheckSquareIcon, AlertCircleIcon } from '../ui/Icons';

interface UserProfileViewProps {
  user: User;
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

const UserProfileView: React.FC<UserProfileViewProps> = ({ user }) => {
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
      <Card>
        <div className="flex items-center space-x-6">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-200"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-600 mt-1">Membro da Equipe</p>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <KpiCard title="Total de Tarefas" value={stats.total} icon={TasksIcon} iconColorClass="text-blue-500" />
        <KpiCard title="Tarefas Concluídas" value={stats.completed} icon={CheckSquareIcon} iconColorClass="text-green-500" />
        <KpiCard title="Tarefas Atrasadas" value={stats.overdue} icon={AlertCircleIcon} iconColorClass="text-red-500" />
      </div>

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