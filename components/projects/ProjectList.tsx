

import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, ProjectStatus, TaskStatus } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon, EyeIcon, UploadIcon } from '../ui/Icons';
import ProjectForm from './ProjectForm';
import TeamManagementModal from '../team/TeamManagementModal';
import FileUpload from '../files/FileUpload';
import SuccessToast from '../ui/SuccessToast';

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
  onUploadFile: () => void;
}> = ({ project, onSelect, onEdit, onDelete, onManageTeam, onUploadFile }) => {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === TaskStatus.Done).length;
  const baseProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const progress = project.status === ProjectStatus.Completed ? 100 : baseProgress;

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
          <button onClick={onSelect} title="Visualizar Projeto" className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-full transition-colors">
            <EyeIcon className="h-5 w-5"/>
          </button>
          <button onClick={onUploadFile} title="Upload de Arquivo" className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-full transition-colors">
            <UploadIcon className="h-5 w-5"/>
          </button>
          <button onClick={onManageTeam} title="Gerenciar Equipe" className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full transition-colors">
            <UsersIcon className="h-5 w-5"/>
          </button>
          <button onClick={onEdit} title="Editar Projeto" className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/20 rounded-full transition-colors">
            <EditIcon className="h-5 w-5"/>
          </button>
          <button onClick={onDelete} title="Excluir Projeto" className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors">
            <TrashIcon className="h-5 w-5"/>
          </button>
        </div>
      </div>
    </Card>
  );
};


const ProjectList: React.FC<ProjectListProps> = ({ setCurrentView, setGlobalProjectFilter }) => {
  const { projects, addProject, updateProject, deleteProject, addFile, refreshData } = useProjectContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [teamModalProject, setTeamModalProject] = useState<Project | null>(null);
  const [uploadModalProjectId, setUploadModalProjectId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    try {
      if ('id' in projectData) {
        await updateProject(projectData as Project);
      } else {
        // Fix: The Omit utility type takes a union of keys as its second argument, not multiple arguments.
        await addProject(projectData as Omit<Project, 'id' | 'tasks' | 'team' | 'files'>);
      }
      setIsFormOpen(false);
      setProjectToEdit(null);
      
      // Atualizar dados sem recarregar a página
      await refreshData();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto. Verifique o console para mais detalhes.');
    }
  };

  const handleUploadFile = async (projectId: string, file: File) => {
    try {
      await addFile(projectId, file);
      setUploadModalProjectId(null);
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Não foi possível fazer o upload do arquivo.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Sucesso */}
      <SuccessToast 
        message="Arquivo enviado com sucesso!"
        isVisible={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        duration={3000}
      />

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
            onUploadFile={() => setUploadModalProjectId(project.id)}
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
      
      <FileUpload 
        isOpen={!!uploadModalProjectId}
        onClose={() => setUploadModalProjectId(null)}
        onUpload={handleUploadFile}
        preSelectedProjectId={uploadModalProjectId || undefined}
      />
    </div>
  );
};

export default ProjectList;