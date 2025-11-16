// Fix: Implemented the KanbanCard component.
import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import Card from '../ui/Card';
import { EditIcon, TrashIcon } from '../ui/Icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    const baseClasses = 'text-xs font-medium px-2 py-0.5 rounded-full';
    switch (priority) {
        case TaskPriority.High:
            return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200`;
        case TaskPriority.Medium:
            return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-amber-500/20 dark:text-amber-200`;
        case TaskPriority.Low:
            return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-sky-500/20 dark:text-sky-200`;
    }
};

const getProjectBadgeStyle = (projectName: string) => {
    const safeName = projectName || 'Projeto';
    const charCodes = safeName
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = charCodes % 360;
    const secondaryHue = (hue + 40) % 360;
    return {
        background: `linear-gradient(135deg, hsl(${hue}, 75%, 55%), hsl(${secondaryHue}, 70%, 50%))`,
        initial: safeName.trim()[0]?.toUpperCase() ?? 'P',
    };
};

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onEdit, onDelete, onView, canEdit }) => {
    const projectBadge = getProjectBadgeStyle(task.projectName);
    // Desativando a funcionalidade de drag and drop
    // Mantendo as variáveis para não quebrar o código
    const setNodeRef = (element: HTMLElement | null) => {};
    const isDragging = false;
    const style = {};
    const attributes = {};
    const listeners = {};
    
    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`group relative cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:shadow-lg ${isDragging ? 'opacity-50 shadow-2xl ring-2 ring-indigo-400 scale-105 rotate-2' : ''}`}
            onClick={onView}
            role="button"
            tabIndex={0}
            {...attributes}
            {...listeners}
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
                <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium tracking-wide">{task.projectName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    {task.assignee ? (
                        <img 
                            src={task.assignee.avatar} 
                            alt={task.assignee.name} 
                            className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-900/60 shadow-sm shadow-slate-900/20"
                            title={task.assignee.name}
                        />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-inner shadow-black/20"
                            style={{ backgroundImage: projectBadge.background }}
                            title={task.projectName}
                        >
                            {projectBadge.initial}
                        </div>
                    )}
                </div>
                <span className={`${getPriorityChip(task.priority)} dark:bg-opacity-30`}>
                    {task.priority}
                </span>
            </div>
             <div className="mt-3 text-xs font-medium flex justify-end">
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200">
                   Início: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
            </div>
        </Card>
    );
};

export default KanbanCard;
