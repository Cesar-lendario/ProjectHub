import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import Card from '../ui/Card';

interface UpcomingTasksProps {
  onNavigateToTasks?: () => void;
}

interface UpcomingTaskItemProps {
    task: Task & { projectName: string };
}

const UpcomingTaskItem: React.FC<UpcomingTaskItemProps> = ({ task }) => {
    const startDate = new Date(task.dueDate).toLocaleDateString('pt-BR');

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:bg-slate-700/50 transition-colors">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-50 text-sm">{task.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{task.projectName}</p>
            </div>
            <div className="flex items-center">
                {task.assignee && (
                    <img src={task.assignee.avatar} alt={task.assignee.name} className="w-7 h-7 rounded-full mr-3" title={task.assignee.name} />
                )}
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300 mr-2">A Fazer</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200">
                    Início: {startDate}
                </span>
            </div>
        </div>
    )
};

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ onNavigateToTasks }) => {
  const { projects } = useProjectContext();

  const upcomingTasks = projects
    .flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name })))
    .filter(t => t.status === TaskStatus.ToDo)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Próximas Tarefas</h3>
        <button 
          onClick={onNavigateToTasks}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Ver todas
        </button>
      </div>
      <div className="space-y-3">
        {upcomingTasks.map(task => (
            <UpcomingTaskItem key={task.id} task={task} />
        ))}
      </div>
      {upcomingTasks.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma tarefa pendente ou em andamento.</p>}
    </Card>
  );
};

export default UpcomingTasks;
