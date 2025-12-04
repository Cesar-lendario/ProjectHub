import React, { useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { jsPDF } from 'jspdf';

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
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2 align-middle" />
              A Fazer ({summary.todo.length})
            </p>
            <div className="ml-5 space-y-3">
              {summary.todo.map(task => (
                <div key={task.id} className="border-l-2 border-yellow-500 pl-3 py-1">
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

  const handleExportPdf = () => {
    if (!project || !summary) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Resumo de Tarefas - ${project.name}`, 14, 20);
    let currentY = 30;

    const ensureSpace = (lines: number = 1) => {
      if (currentY + lines * 6 > 280) {
        doc.addPage();
        currentY = 20;
      }
    };

    const sections = [
      { title: 'Pendente', tasks: summary.pending, color: '#ef4444' },
      { title: 'A Fazer', tasks: summary.todo, color: '#FFD700' },
      { title: 'Em andamento', tasks: summary.inProgress, color: '#3b82f6' },
    ];

    sections.forEach((section) => {
      if (section.tasks.length === 0) return;
      ensureSpace(2);
      doc.setFontSize(12);
      doc.setTextColor(section.color);
      doc.text(`${section.title} (${section.tasks.length})`, 14, currentY);
      currentY += 6;
      doc.setTextColor('#0f172a');
      section.tasks.forEach((task) => {
        ensureSpace(3);
        doc.setFontSize(10);
        doc.text(`• ${task.name}`, 16, currentY);
        currentY += 5;
        doc.setFontSize(8);
        doc.text(`   Data: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}`, 16, currentY);
        currentY += 5;
        if (task.description) {
            const wrapped = doc.splitTextToSize(task.description, 168);
        wrapped.forEach(line => {
          ensureSpace(1);
          doc.text(`   ${line}`, 16, currentY);
          currentY += 5;
        });
        }
        currentY += 4;
      });
    });

    doc.save(`resumo-${project.name.replace(/\s+/g, '-')}.pdf`);
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
        <div className="flex justify-between gap-3">
          <Button type="button" variant="secondary" onClick={handleExportPdf} disabled={!summary}>
            Gerar PDF
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskSummaryModal;
