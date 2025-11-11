// Fix: Implemented the ProjectList component to display projects and manage selection and forms.
import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { Project, ProjectStatus, TaskStatus, Project as ProjectType, GlobalRole } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, FolderIcon } from '../ui/Icons';
import ProjectDetail from './ProjectDetail';
import ProjectForm from './ProjectForm';

const ProjectCard: React.FC<{ project: Project; onSelect: () => void; isSelected: boolean }> = ({ project, onSelect, isSelected }) => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === TaskStatus.Done).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
    const statusClasses: { [key in ProjectStatus]: string } = {
        [ProjectStatus.InProgress]: 'bg-blue-100 text-blue-800',
        [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
        [ProjectStatus.Completed]: 'bg-green-100 text-green-800',
        [ProjectStatus.Canceled]: 'bg-red-100 text-red-800',
    };

    return (
        <Card onClick={onSelect} className={`cursor-pointer border-2 ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent hover:border-slate-300'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-800 truncate">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.clientName}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[project.status]}`}>{project.status}</span>
            </div>
            <p className="text-sm text-slate-600 my-3 line-clamp-2 h-10">{project.description}</p>
            <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Progresso</span>
                <span className="font-semibold text-slate-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </Card>
    )
}


const ProjectList: React.FC = () => {
    const { projects, addProject, updateProject, getProjectRole } = useProjectContext();
    const { profile } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    const isGlobalAdmin = profile?.role === GlobalRole.Admin;

    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId);
    }, [projects, selectedProjectId]);
    
    const canEditSelectedProject = selectedProject ? (isGlobalAdmin || getProjectRole(selectedProject.id) === 'admin') : false;

    const handleAddProject = () => {
        setProjectToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setIsFormOpen(true);
    }

    const handleSaveProject = async (projectData: Omit<ProjectType, 'id'> | ProjectType) => {
        try {
            if ('id' in projectData) {
                await updateProject(projectData);
            } else {
                await addProject(projectData);
            }
            setIsFormOpen(false);
        } catch(error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Could not save project.");
        }
    }
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Project List Column */}
            <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                <Card className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Projetos</h2>
                        {isGlobalAdmin && (
                            <button onClick={handleAddProject} className="flex items-center gap-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg">
                                <PlusIcon className="h-4 w-4" />
                                <span>Novo</span>
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto -mr-4 pr-4 space-y-3">
                        {projects.map(p => (
                            <ProjectCard 
                                key={p.id}
                                project={p}
                                onSelect={() => setSelectedProjectId(p.id)}
                                isSelected={p.id === selectedProjectId}
                            />
                        ))}
                         {projects.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                <FolderIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-2">Nenhum projeto encontrado.</p>
                                {isGlobalAdmin && <p>Clique em "Novo" para começar.</p>}
                            </div>
                         )}
                    </div>
                </Card>
            </div>
            {/* Project Detail Column */}
            <div className="flex-1 overflow-y-auto">
                {selectedProject ? (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h1>
                                <p className="text-slate-600 mt-1">{selectedProject.projectType}</p>
                            </div>
                            {canEditSelectedProject && (
                                <button onClick={() => handleEditProject(selectedProject)} className="text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg">
                                    Editar Projeto
                                </button>
                            )}
                        </div>
                        <ProjectDetail project={selectedProject} />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Card className="text-center text-slate-500">
                             <FolderIcon className="mx-auto h-16 w-16 text-slate-300" />
                             <h2 className="mt-4 text-lg font-medium">Selecione um projeto</h2>
                             <p>Escolha um projeto da lista para ver seus detalhes.</p>
                        </Card>
                    </div>
                )}
            </div>
            
            <ProjectForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
            />
        </div>
    );
};

export default ProjectList;