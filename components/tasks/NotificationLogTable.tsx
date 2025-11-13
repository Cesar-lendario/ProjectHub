import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

const NotificationLogTable: React.FC = () => {
  const { projects } = useProjectContext();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="bg-slate-900/70 border border-slate-700/40 shadow-lg shadow-indigo-900/20 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-slate-50 mb-4 px-1">Histórico de Cobranças</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-800/40">
        <table className="min-w-full divide-y divide-slate-800/50">
          <thead className="bg-slate-900/60">
            <tr>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Empresa</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Contato</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tipo Projeto</th>
              <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Tarefas Ativas</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Data E-mail</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Data WhatsApp</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/30 divide-y divide-slate-800/40">
            {projects.map((project) => {
              const activeTasksCount = project.tasks.filter(t => 
                t.status === TaskStatus.Pending || 
                t.status === TaskStatus.ToDo || 
                t.status === TaskStatus.InProgress
              ).length;

              return (
                <tr key={project.id} className="hover:bg-slate-800/70 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-slate-100">{project.name || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.clientName || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.projectType}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-200 text-center font-semibold">{activeTasksCount}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{formatDate(project.lastEmailNotification)}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{formatDate(project.lastWhatsappNotification)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum projeto para exibir.</p>
        )}
      </div>
    </Card>
  );
};

export default NotificationLogTable;