import React, { useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TaskSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

const TaskSummaryModal: React.FC<TaskSummaryModalProps> = ({ isOpen, onClose, projectId }) => {
  const { projects } = useProjectContext();

  const project = useMemo(
    () => projects.find(p => p.id === projectId),
    [projects, projectId]
  );

  const summary = useMemo(() => {
    if (!project) return null;

    const tasks = project.tasks || [];
    const pending = tasks.filter(t => t.status === TaskStatus.Pending);
    const todo = tasks.filter(t => t.status === TaskStatus.ToDo);
    const inProgress = tasks.filter(t => t.status === TaskStatus.InProgress);

    return { pending, todo, inProgress };
  }, [project]);

  const renderContent = () => {
    if (!projectId || !project) {
      return (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Selecione um projeto específico no filtro da página de tarefas para visualizar o resumo.
        </p>
      );
    }

    if (!summary || (summary.pending.length === 0 && summary.todo.length === 0 && summary.inProgress.length === 0)) {
      return (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Não há tarefas com status <strong>Pendente</strong>, <strong>A Fazer</strong> ou <strong>Em andamento</strong> para o projeto
          {' '}<span className="font-semibold">{project.name}</span>.
        </p>
      );
    }

    return (
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
        <p>
          Resumo das tarefas do projeto <span className="font-semibold">{project.name}</span> nos status
          {' '}<strong>Pendente</strong>, <strong>A Fazer</strong> e <strong>Em andamento</strong>.
        </p>

        {/* Pendente */}
        {summary.pending.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 align-middle" />
              Pendente ({summary.pending.length})
            </p>
            <div className="ml-5 space-y-3">
              {summary.pending.map(task => (
                <div key={task.id} className="border-l-2 border-red-500 pl-3 py-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{task.name}</p>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Início: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A Fazer */}
        {summary.todo.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2 align-middle" />
              A Fazer ({summary.todo.length})
            </p>
            <div className="ml-5 space-y-3">
              {summary.todo.map(task => (
                <div key={task.id} className="border-l-2 border-purple-500 pl-3 py-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{task.name}</p>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Início: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Em andamento */}
        {summary.inProgress.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2 align-middle" />
              Em andamento ({summary.inProgress.length})
            </p>
            <div className="ml-5 space-y-3">
              {summary.inProgress.map(task => (
                <div key={task.id} className="border-l-2 border-blue-500 pl-3 py-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{task.name}</p>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Início: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 Resumo de Tarefas"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {renderContent()}
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskSummaryModal;
