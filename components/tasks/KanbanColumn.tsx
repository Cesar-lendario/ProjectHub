// Fix: Implemented the KanbanColumn component.
import React from 'react';
import { Task, TaskStatus } from '../../types';
import KanbanCard from './KanbanCard';

type EnhancedTask = Task & {
  projectName: string;
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: EnhancedTask[];
  onEditTask: (task: EnhancedTask) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask: (task: EnhancedTask) => void;
  canEditTask: (task: EnhancedTask) => boolean;
}

const getStatusAppearance = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Pending: return { bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-400' };
        case TaskStatus.ToDo: return { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400' };
        case TaskStatus.InProgress: return { bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-400' };
        case TaskStatus.Done: return { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-400' };
    }
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onEditTask, onDeleteTask, onViewTask, canEditTask }) => {
    const { bg, text, border } = getStatusAppearance(status);

    return (
        <div className={`bg-slate-50 rounded-xl p-4 border-t-4 ${border}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-lg ${text}`}>{status}</h3>
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${bg} ${text}`}>{tasks.length}</span>
            </div>
            <div className="space-y-4">
                {tasks.map(task => (
                    <KanbanCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => onEditTask(task)} 
                        onDelete={() => onDeleteTask(task.id)}
                        onView={() => onViewTask(task)}
                        canEdit={canEditTask(task)} />
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                        Nenhuma tarefa aqui.
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
