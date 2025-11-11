// Fix: Implemented the KanbanCard component.
import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import Card from '../ui/Card';
import { EditIcon, TrashIcon } from '../ui/Icons';

type EnhancedTask = Task & {
  projectName: string;
};

interface KanbanCardProps {
  task: EnhancedTask;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  canEdit: boolean;
}

const getPriorityChip = (priority: TaskPriority) => {
    const baseClasses = "text-xs font-medium px-2 py-0.5 rounded-full";
    switch (priority) {
        case TaskPriority.High: return `${baseClasses} bg-red-100 text-red-800`;
        case TaskPriority.Medium: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case TaskPriority.Low: return `${baseClasses} bg-blue-100 text-blue-800`;
    }
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onEdit, onDelete, onView, canEdit }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
    
    return (
        <Card
            className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onView();
                }
            }}
        >
            {canEdit && (
                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit();
                        }}
                        className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Editar tarefa"
                    >
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Excluir tarefa"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-50 text-base pr-6">{task.name}</p>
                <p className="text-sm text-indigo-600 font-medium">{task.projectName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    {task.assignee ? (
                        <img 
                            src={task.assignee.avatar} 
                            alt={task.assignee.name} 
                            className="w-7 h-7 rounded-full ring-2 ring-white"
                            title={task.assignee.name}
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200" title="Não atribuído"></div>
                    )}
                </div>
                <span className={getPriorityChip(task.priority)}>{task.priority}</span>
            </div>
             <div className="mt-3 text-xs font-medium flex justify-end">
                <span className={`px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                   Vence em: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
            </div>
        </Card>
    );
};

export default KanbanCard;
