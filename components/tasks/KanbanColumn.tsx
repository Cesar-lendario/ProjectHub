// Fix: Implemented the KanbanColumn component.
import React from 'react';
import { Task, TaskStatus } from '../../types';
import KanbanCard from './KanbanCard';
import { useDroppable } from '@dnd-kit/core';

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
        case TaskStatus.Pending: return { bg: 'bg-purple-200 dark:bg-purple-500/20', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-400 dark:border-purple-500/40' };
        case TaskStatus.ToDo: return { bg: 'bg-slate-200 dark:bg-slate-500/20', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-400 dark:border-slate-500/40' };
        case TaskStatus.InProgress: return { bg: 'bg-yellow-200 dark:bg-amber-500/20', text: 'text-yellow-800 dark:text-amber-200', border: 'border-yellow-400 dark:border-amber-500/40' };
        case TaskStatus.Done: return { bg: 'bg-green-200 dark:bg-emerald-500/20', text: 'text-green-800 dark:text-emerald-200', border: 'border-green-400 dark:border-emerald-500/40' };
    }
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onEditTask, onDeleteTask, onViewTask, canEditTask }) => {
    const { bg, text, border } = getStatusAppearance(status);
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: { type: 'column', status },
    });

    return (
        <div
            ref={setNodeRef}
            className={`bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 border-t-4 ${border} backdrop-blur-sm transition-all ${
                isOver ? 'ring-2 ring-indigo-400 dark:ring-indigo-300 ring-offset-2' : ''
            }`}
        >
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
