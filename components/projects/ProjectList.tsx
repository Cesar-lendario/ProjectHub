

import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, ProjectStatus } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon } from '../ui/Icons';
import ProjectForm from './ProjectForm';
import TeamManagementModal from '../team/TeamManagementModal';

interface ProjectListProps {
  setCurrentView: (view: string) => void;
  setGlobalProjectFilter: (id: string) => void;
}

const ProjectCard: React.FC<{
  project: Project;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageTeam: () => void;
}> = ({ project, onSelect, onEdit, onDelete, onManageTeam }) => {
  const progress = project.tasks.length > 0
    ? (project.tasks.filter(t => t.status === 'Concluído').length / project.tasks.length) * 100
    : 0;

  const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.InProgress]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.Completed]: 'bg-green-100 text-green-800',
    [ProjectStatus.Canceled]: 'bg-red-100 text-red-800',
  };
  
  return (
    <Card className="flex flex-col cursor-pointer group hover:shadow-xl hover:border-indigo-300 transition-all duration-200" onClick={onSelect}>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-50 group-hover:text-indigo-600 transition-colors">
            {project.name}
          </h3>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{project.description}</p>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span>Progresso</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="flex -space-x-2">
          {project.team.slice(0, 3).map(member => (
            <img key={member.user.id} src={member.user.avatar} alt={member.user.name} className="w-8 h-8 rounded-full ring-2 ring-white" />
          ))}
          {project.team.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 ring-2 ring-white">
              +{project.team.length - 3}
            </div>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onManageTeam} title="Gerenciar Equipe" className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"><UsersIcon className="h-5 w-5"/></button>
          <button onClick={onEdit} title="Editar" className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"><EditIcon className="h-5 w-5"/></button>
          <button onClick={onDelete} title="Excluir" className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="h-5 w-5"/></button>
        </div>
      </div>
    </Card>
  );
};


const ProjectList: React.FC<ProjectListProps> = ({ setCurrentView, setGlobalProjectFilter }) => {
  const { projects, addProject, updateProject, deleteProject } = useProjectContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [teamModalProject, setTeamModalProject] = useState<Project | null>(null);

  const handleProjectSelect = (projectId: string) => {
    setGlobalProjectFilter(projectId);
    setCurrentView('tasks');
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto e todas as suas tarefas?')) {
      await deleteProject(projectId);
    }
  };

  const handleSave = async (projectData: Omit<Project, 'id'> | Project) => {
    if ('id' in projectData) {
      await updateProject(projectData as Project);
    } else {
      // Fix: The Omit utility type takes a union of keys as its second argument, not multiple arguments.
      await addProject(projectData as Omit<Project, 'id' | 'tasks' | 'team' | 'files'>);
    }
    setIsFormOpen(false);
    setProjectToEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Projetos</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Acompanhe todos os seus projetos em um só lugar.</p>
        </div>
        <button onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
          <PlusIcon className="h-5 w-5" />
          <span>Novo Projeto</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onSelect={() => handleProjectSelect(project.id)}
            onEdit={() => handleEdit(project)}
            onDelete={() => handleDelete(project.id)}
            onManageTeam={() => setTeamModalProject(project)}
          />
        ))}
      </div>
       {projects.length === 0 && <p className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum projeto foi criado ainda.</p>}

      <ProjectForm 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setProjectToEdit(null); }}
        onSave={handleSave}
        projectToEdit={projectToEdit}
      />
      {teamModalProject && (
        <TeamManagementModal 
            isOpen={!!teamModalProject}
            onClose={() => setTeamModalProject(null)}
            project={teamModalProject}
        />
      )}
    </div>
  );
};

export default ProjectList;