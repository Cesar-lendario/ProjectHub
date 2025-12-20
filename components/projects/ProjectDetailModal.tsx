import React from 'react';
import { Project, ProjectStatus, TaskStatus } from '../../types';
import Modal from '../ui/Modal';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project }) => {
  if (!project) return null;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === TaskStatus.Done).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusBadge = (status: ProjectStatus) => {
    const badges = {
      [ProjectStatus.Planning]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      [ProjectStatus.InProgress]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      [ProjectStatus.Completed]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      [ProjectStatus.Cancelled]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[status] || '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visualização do Projeto" size="xl">
      <div className="p-4 space-y-3">
        {/* Grid 3 colunas: Nome, Tipo e Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nome do Projeto
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-900 dark:text-slate-50 font-semibold truncate" title={project.name}>
                {project.name}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Projeto
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-900 dark:text-slate-50 truncate">
                {project.projectType || 'Não definido'}
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Grid 2 colunas: Contato e Email */}
        {(project.clientName || project.clientEmail) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.clientName && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Contato
                </label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-900 dark:text-slate-50 truncate">{project.clientName}</p>
                </div>
              </div>
            )}
            {project.clientEmail && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email do Contato
                </label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <a href={`mailto:${project.clientEmail}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                    {project.clientEmail}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Descrição - compacta */}
        {project.description && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 max-h-16 overflow-y-auto">
              <p className="text-sm text-slate-900 dark:text-slate-50 line-clamp-3">{project.description}</p>
            </div>
          </div>
        )}

        {/* Grid 2 colunas: Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data de Início
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-900 dark:text-slate-50">
                {new Date(project.startDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data de Fim
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-900 dark:text-slate-50">
                {new Date(project.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Progresso - compacto */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Progresso
          </label>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {completedTasks}/{totalTasks} concluídas
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Equipe - compacta */}
        {project.team && project.team.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Equipe ({project.team.length})
            </label>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex flex-wrap gap-2">
                {project.team.map(member => (
                  <div key={member.user.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                    <img 
                      src={member.user.avatar} 
                      alt={member.user.name} 
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-50 leading-tight">
                        {member.user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjectDetailModal;

