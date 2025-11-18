

import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, ProjectStatus, TaskStatus, ProjectType } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon, EyeIcon, UploadIcon, DocumentTextIcon } from '../ui/Icons';
import ProjectForm from './ProjectForm';
import TeamManagementModal from '../team/TeamManagementModal';
import FileUpload from '../files/FileUpload';
import SuccessToast from '../ui/SuccessToast';
import ProjectConditionModal from '../tasks/ProjectConditionModal';

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
  onOpenCondition: () => void;
}> = ({ project, onSelect, onEdit, onDelete, onManageTeam, onUploadFile, onOpenCondition }) => {
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
          <button onClick={onOpenCondition} title="Condição do Projeto / Anotações" className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/20 rounded-full transition-colors">
            <DocumentTextIcon className="h-5 w-5"/>
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
  const [conditionModalProjectId, setConditionModalProjectId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterName, setFilterName] = useState('');
  const [filterProjectType, setFilterProjectType] = useState<ProjectType | 'all'>('all');
  const [filterClientName, setFilterClientName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');

  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        const matchesName = filterName
          ? project.name.toLowerCase().includes(filterName.toLowerCase())
          : true;

        const matchesType = filterProjectType === 'all'
          ? true
          : project.projectType === filterProjectType;

        const matchesClientName = filterClientName
          ? (project.clientName || '').toLowerCase().includes(filterClientName.toLowerCase())
          : true;

        const matchesStartDate = filterStartDate
          ? project.startDate === filterStartDate
          : true;

        return matchesName && matchesType && matchesClientName && matchesStartDate;
      })
      .sort((a, b) => {
        // Calcular progresso de cada projeto
        const progressA = a.status === ProjectStatus.Completed 
          ? 100 
          : a.tasks.length > 0 
            ? (a.tasks.filter(t => t.status === TaskStatus.Done).length / a.tasks.length) * 100 
            : 0;
        
        const progressB = b.status === ProjectStatus.Completed 
          ? 100 
          : b.tasks.length > 0 
            ? (b.tasks.filter(t => t.status === TaskStatus.Done).length / b.tasks.length) * 100 
            : 0;
        
        // Ordenar do menos concluído ao mais concluído (crescente)
        return progressA - progressB;
      });
  }, [projects, filterName, filterProjectType, filterClientName, filterStartDate]);

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

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Projetos</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Acompanhe todos os seus projetos em um só lugar.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'cards' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              Cartões
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              Lista
            </button>
          </div>
          <button onClick={() => { setProjectToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
            <PlusIcon className="h-5 w-5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Nome da Empresa</label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Buscar por empresa..."
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Tipo de Projeto</label>
          <select
            value={filterProjectType}
            onChange={(e) => setFilterProjectType(e.target.value as ProjectType | 'all')}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos os tipos</option>
            {Object.values(ProjectType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Nome do Contato</label>
          <input
            type="text"
            value={filterClientName}
            onChange={(e) => setFilterClientName(e.target.value)}
            placeholder="Buscar por contato..."
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Data de Início</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {filteredProjects.length === 0 && (
        <p className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum projeto foi criado ainda.</p>
      )}

      {filteredProjects.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onSelect={() => handleProjectSelect(project.id)}
              onEdit={() => handleEdit(project)}
              onDelete={() => handleDelete(project.id)}
              onManageTeam={() => setTeamModalProject(project)}
              onUploadFile={() => setUploadModalProjectId(project.id)}
              onOpenCondition={() => setConditionModalProjectId(project.id)}
            />
          ))}
        </div>
      )}

      {filteredProjects.length > 0 && viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">Lista de Projetos</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredProjects.map(project => {
              const totalTasks = project.tasks.length;
              const completedTasks = project.tasks.filter(t => t.status === TaskStatus.Done).length;
              const baseProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const progress = project.status === ProjectStatus.Completed ? 100 : baseProgress;

              return (
                <div
                  key={project.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{project.name}</h3>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {project.projectType}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{project.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>Início: {new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                      <span>Fim: {new Date(project.endDate).toLocaleDateString('pt-BR')}</span>
                      <span>Tarefas: {completedTasks}/{totalTasks}</span>
                      <span className="font-bold">Progresso: {Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setUploadModalProjectId(project.id)} title="Upload de Arquivo" className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-full transition-colors">
                      <UploadIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setConditionModalProjectId(project.id)} title="Condição do Projeto / Anotações" className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/20 rounded-full transition-colors">
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setTeamModalProject(project)} title="Gerenciar Equipe" className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-full transition-colors">
                      <UsersIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleEdit(project)} title="Editar Projeto" className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/20 rounded-full transition-colors">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(project.id)} title="Excluir Projeto" className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      
      <ProjectConditionModal 
        isOpen={!!conditionModalProjectId}
        onClose={() => setConditionModalProjectId(null)}
        projectId={conditionModalProjectId || undefined}
      />
    </div>
  );
};

export default ProjectList;