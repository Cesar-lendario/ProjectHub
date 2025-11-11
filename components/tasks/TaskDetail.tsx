// Fix: Implemented the TaskDetail component as a modal.
import React from 'react';
import { Task } from '../../types';
import { XIcon } from '../ui/Icons';

type EnhancedTask = Task & {
  projectName: string;
};

interface TaskDetailProps {
  task: EnhancedTask;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">{task.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50">
             <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">{task.description || 'Nenhuma descrição fornecida.'}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Projeto</p>
                    <p className="text-slate-800 dark:text-slate-50">{task.projectName}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Responsável</p>
                    <div className="flex items-center gap-2 mt-1">
                        {task.assignee ? (
                            <>
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                                <span className="text-slate-800 dark:text-slate-50">{task.assignee.name}</span>
                            </>
                        ) : (
                            <span className="text-slate-800 dark:text-slate-50">Não atribuído</span>
                        )}
                    </div>
                </div>
                 <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Data de Vencimento</p>
                    <p className="text-slate-800 dark:text-slate-50">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Prioridade</p>
                    <p className="text-slate-800 dark:text-slate-50">{task.priority}</p>
                </div>
                 <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Status</p>
                    <p className="text-slate-800 dark:text-slate-50">{task.status}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Duração</p>
                    <p className="text-slate-800 dark:text-slate-50">{task.duration} dia(s)</p>
                </div>
            </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 dark:bg-slate-700/30 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
