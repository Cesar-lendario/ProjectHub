import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
// Fix: Corrected 'UserIcon' to 'UsersIcon' and removed unused icon imports.
import { XIcon, EditIcon, UsersIcon } from '../ui/Icons';
import { EnhancedTask } from './TaskList';

interface TaskDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: EnhancedTask) => void;
  task: EnhancedTask | null;
}

const getPriorityChip = (priority: TaskPriority) => {
    const baseClasses = "text-sm font-semibold px-3 py-1 rounded-full inline-block";
    switch (priority) {
        case TaskPriority.High: return `${baseClasses} bg-red-100 text-red-800`;
        case TaskPriority.Medium: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case TaskPriority.Low: return `${baseClasses} bg-blue-100 text-blue-800`;
        default: return `${baseClasses} bg-slate-100 text-slate-800`;
    }
}

const getStatusChip = (status: TaskStatus) => {
    const baseClasses = "text-sm font-semibold px-3 py-1 rounded-full inline-block";
    switch (status) {
        case TaskStatus.Pending: return `${baseClasses} bg-purple-200 text-purple-800`;
        case TaskStatus.ToDo: return `${baseClasses} bg-slate-200 text-slate-800`;
        case TaskStatus.InProgress: return `${baseClasses} bg-orange-200 text-orange-800`;
        case TaskStatus.Done: return `${baseClasses} bg-green-200 text-green-800`;
        default: return `${baseClasses} bg-slate-100 text-slate-800`;
    }
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-medium text-slate-500">{label}</h4>
        <div className="mt-1 text-slate-800">{value}</div>
    </div>
);


const TaskDetail: React.FC<TaskDetailProps> = ({ isOpen, onClose, onEdit, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 truncate pr-4">{task.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 flex-shrink-0">
             <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Descrição</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{task.description || 'Nenhuma descrição fornecida.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6">
                <DetailRow label="Projeto" value={
                    <span className="font-medium text-indigo-700">{task.projectName}</span>
                } />
                <DetailRow label="Responsável" value={
                    task.assignee ? (
                        <div className="flex items-center">
                            <img className="h-8 w-8 rounded-full" src={task.assignee.avatar} alt={task.assignee.name} />
                            <span className="ml-3 font-medium">{task.assignee.name}</span>
                        </div>
                    ) : (
                      <div className="flex items-center text-slate-500">
                        <UsersIcon className="h-5 w-5 mr-2" />
                        <span className="italic">Não atribuído</span>
                      </div>
                    )
                } />
                 <DetailRow label="Data de Vencimento" value={
                    <span className="font-medium">{new Date(task.dueDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                }/>
                <DetailRow label="Prioridade" value={
                    <span className={getPriorityChip(task.priority)}>{task.priority}</span>
                } />
                <DetailRow label="Status" value={
                     <span className={getStatusChip(task.status)}>{task.status}</span>
                } />
                <DetailRow label="Duração Estimada" value={
                    <span className="font-medium">{task.duration} {task.duration > 1 ? 'dias' : 'dia'}</span>
                } />
            </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Fechar
            </button>
            <button type="button" onClick={() => onEdit(task)} className="ml-3 inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <EditIcon className="h-4 w-4" />
                Editar Tarefa
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;