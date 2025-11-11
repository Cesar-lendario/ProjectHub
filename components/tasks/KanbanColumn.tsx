import React, { useRef } from 'react';
import { TaskStatus } from '../../types';
import KanbanCard from './KanbanCard';
import { EnhancedTask } from './TaskList';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: EnhancedTask[];
  onTaskDrop: (taskId: string, projectId: string, status: TaskStatus, index: number) => void;
  onViewTask: (task: EnhancedTask) => void;
  onEditTask: (task: EnhancedTask) => void;
  onDeleteTask: (task: EnhancedTask) => void;
}

const getStatusColor = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Pending: return 'border-t-purple-400';
        case TaskStatus.ToDo: return 'border-t-slate-400';
        case TaskStatus.InProgress: return 'border-t-yellow-400';
        case TaskStatus.Done: return 'border-t-green-500';
    }
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onTaskDrop, onViewTask, onEditTask, onDeleteTask }) => {
    const [isOver, setIsOver] = React.useState(false);
    const columnRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const projectId = e.dataTransfer.getData('projectId');

        const cards = Array.from(columnRef.current?.querySelectorAll('[data-task-id]') || []);
        let newIndex = cards.length;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i] as HTMLElement;
            const rect = card.getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                newIndex = i;
                break;
            }
        }
        
        onTaskDrop(taskId, projectId, status, newIndex);
        setIsOver(false);
    };

  return (
    <div 
        ref={columnRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-slate-100 rounded-lg flex flex-col transition-all duration-300 ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''}`}
    >
        <div className={`p-4 border-t-4 ${getStatusColor(status)} rounded-t-lg`}>
            <h3 className="font-bold text-slate-700 flex items-center">
                {status} 
                <span className="ml-2 text-sm font-medium bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                    {tasks.length}
                </span>
            </h3>
        </div>
        <div className="p-2 flex-1 overflow-y-auto space-y-3">
            {tasks.map(task => (
                <KanbanCard 
                    key={task.id}
                    task={task}
                    onView={() => onViewTask(task)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task)}
                />
            ))}
        </div>
    </div>
  );
};

export default KanbanColumn;