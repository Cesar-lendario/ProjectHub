import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import Card from '../ui/Card';

interface UpcomingTasksProps {
  onNavigateToTasks?: () => void;
  onNavigateToTasksWithProject?: (projectId: string) => void;
}

interface UpcomingTaskItemProps {
  task: Task & { projectName: string; projectId: string };
  onClick?: () => void;
}

const UpcomingTaskItem: React.FC<UpcomingTaskItemProps> = ({ task, onClick }) => {
    const startDate = new Date(task.dueDate).toLocaleDateString('pt-BR');
    
    // Mapear prioridade para cor e texto
    const priorityConfig = {
      [TaskPriority.High]: { 
        bg: 'bg-red-100 dark:bg-red-500/20', 
        text: 'text-red-700 dark:text-red-300',
        label: 'Alta'
      },
      [TaskPriority.Medium]: { 
        bg: 'bg-yellow-100 dark:bg-yellow-500/20', 
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Média'
      },
      [TaskPriority.Low]: { 
        bg: 'bg-green-100 dark:bg-green-500/20', 
        text: 'text-green-700 dark:text-green-300',
        label: 'Baixa'
      },
    };
    
    const priority = priorityConfig[task.priority] || priorityConfig[TaskPriority.Low];

    return (
        <div 
          onClick={onClick}
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
        >
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-50 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {task.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.projectName}</p>
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {task.assignee && (
                    <img 
                      src={task.assignee.avatar} 
                      alt={task.assignee.name} 
                      className="w-7 h-7 rounded-full" 
                      title={task.assignee.name} 
                    />
                )}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priority.bg} ${priority.text}`}>
                  {priority.label}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200">
                    {startDate}
                </span>
            </div>
        </div>
    )
};

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ onNavigateToTasks, onNavigateToTasksWithProject }) => {
  const { projects } = useProjectContext();

  // Ordem de prioridade para ordenação
  const priorityOrder = {
    [TaskPriority.High]: 1,
    [TaskPriority.Medium]: 2,
    [TaskPriority.Low]: 3,
  };

  const upcomingTasks = projects
    .flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.id })))
    .filter(t => t.status === TaskStatus.ToDo)
    .sort((a, b) => {
      // 1. Ordenar por data (mais antiga primeiro)
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      // 2. Se datas iguais, ordenar por prioridade (Alta → Média → Baixa)
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  const handleTaskClick = (task: Task & { projectId: string }) => {
    if (onNavigateToTasksWithProject) {
      onNavigateToTasksWithProject(task.projectId);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Próximas Tarefas a Fazer</h3>
        <button 
          onClick={onNavigateToTasks}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Ver todas
        </button>
      </div>
      <div className="space-y-3">
        {upcomingTasks.map(task => (
            <UpcomingTaskItem 
              key={task.id} 
              task={task} 
              onClick={() => handleTaskClick(task)}
            />
        ))}
      </div>
      {upcomingTasks.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhuma tarefa "A Fazer" encontrada.</p>}
    </Card>
  );
};

export default UpcomingTasks;
