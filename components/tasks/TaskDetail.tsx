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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/40 overflow-hidden bg-white/95 dark:bg-slate-900/90">
        <div className="flex justify-between items-start gap-4 p-6 border-b border-slate-200/80 dark:border-slate-700/60">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{task.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Última atualização em {new Date(task.updated_at ?? task.dueDate).toLocaleDateString('pt-BR')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fechar"
          >
             <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-200/80 dark:border-slate-700/60">
              <p className="text-slate-600 dark:text-slate-200 leading-relaxed">
                {task.description || 'Nenhuma descrição fornecida.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Projeto
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{task.projectName}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Responsável
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        {task.assignee ? (
                            <>
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800/70 shadow-sm shadow-black/20" />
                                <span className="text-base font-medium text-slate-900 dark:text-white">{task.assignee.name}</span>
                            </>
                        ) : (
                            <span className="text-base font-medium text-slate-900 dark:text-white">Não atribuído</span>
                        )}
                    </div>
                </div>
                 <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Data de Início
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Prioridade
                    </p>
                    <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                      {task.priority}
                    </span>
                </div>
                 <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Status
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{task.status}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                      Duração
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">{task.duration} dia(s)</p>
                </div>
            </div>
        </div>
        <div className="flex justify-end items-center gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
