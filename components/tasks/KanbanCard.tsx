import React, { useState } from 'react';
import { EnhancedTask } from './TaskList';
import { TaskPriority } from '../../types';
import Card from '../ui/Card';
import { EyeIcon, EditIcon, TrashIcon } from '../ui/Icons';
import ProjectIcon from '../projects/ProjectIcon';

interface KanbanCardProps {
  task: EnhancedTask;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const getPriorityChip = (priority: TaskPriority) => {
    const baseClasses = "text-xs font-semibold px-2 py-0.5 rounded-full inline-block";
    switch (priority) {
        case TaskPriority.High: return `${baseClasses} bg-red-100 text-red-800`;
        case TaskPriority.Medium: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case TaskPriority.Low: return `${baseClasses} bg-blue-100 text-blue-800`;
        default: return `${baseClasses} bg-slate-100 text-slate-800`;
    }
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onView, onEdit, onDelete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Concluído';

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('projectId', task.projectId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

  return (
    <Card 
        className={`p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-task-id={task.id}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-semibold text-slate-800 text-sm mb-2 pr-2">{task.name}</h4>
            <span className={getPriorityChip(task.priority)}>{task.priority}</span>
        </div>
        
        <p className="text-xs text-slate-500 mb-3">{task.projectName}</p>
        
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <ProjectIcon projectId={task.projectId} />
                <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded-full ${isOverdue ? 'text-red-700 bg-red-100' : 'text-slate-600'}`}>
                    {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
            </div>
            
            <div className="flex items-center gap-1">
                <button onClick={onView} title="Visualizar" className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-indigo-600"><EyeIcon className="h-4 w-4"/></button>
                <button onClick={onEdit} title="Editar" className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-indigo-600"><EditIcon className="h-4 w-4"/></button>
                <button onClick={onDelete} title="Excluir" className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
            </div>
        </div>
    </Card>
  );
};

export default KanbanCard;