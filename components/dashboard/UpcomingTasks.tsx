import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import Card from '../ui/Card';

interface UpcomingTaskItemProps {
    task: Task & { projectName: string };
}

const UpcomingTaskItem: React.FC<UpcomingTaskItemProps> = ({ task }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = dueDateOnly.getTime() - todayDateOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dateText;
    if (isOverdue) {
        dateText = `Atrasada há ${Math.abs(diffDays)} dia(s)`;
    } else if (diffDays === 0) {
        dateText = 'Vence hoje';
    } else if (diffDays === 1) {
        dateText = 'Vence amanhã';
    } else {
        dateText = `Vence em ${diffDays} dias`;
    }

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div>
                <p className="font-semibold text-slate-800 text-sm">{task.name}</p>
                <p className="text-xs text-slate-500">{task.projectName}</p>
            </div>
            <div className="flex items-center">
                {task.assignee && (
                    <img src={task.assignee.avatar} alt={task.assignee.name} className="w-7 h-7 rounded-full mr-3" title={task.assignee.name} />
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {dateText}
                </span>
            </div>
        </div>
    )
};

const UpcomingTasks: React.FC = () => {
  const { projects } = useProjectContext();

  const upcomingTasks = projects
    .flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name })))
    .filter(t => t.status !== TaskStatus.Done)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Próximas Tarefas</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          Ver todas
        </button>
      </div>
      <div className="space-y-3">
        {upcomingTasks.map(task => (
            <UpcomingTaskItem key={task.id} task={task} />
        ))}
      </div>
      {upcomingTasks.length === 0 && <p className="text-center py-8 text-slate-500">Nenhuma tarefa pendente ou em andamento.</p>}
    </Card>
  );
};

export default UpcomingTasks;
