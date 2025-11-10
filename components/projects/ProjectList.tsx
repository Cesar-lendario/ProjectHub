
import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, ProjectStatus, TaskStatus } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, EditIcon, TrashIcon, AlertCircleIcon } from '../ui/Icons';
import ProjectForm from './ProjectForm';
import ProjectDetail from './ProjectDetail';

const ProjectCard: React.FC<{ 
    project: Project; 
    onSelect: () => void; 
    onEdit: () => void;
    onDelete: () => void;
    isSelected: boolean;
}> = ({ project, onSelect, onEdit, onDelete, isSelected }) => {

    const progress = project.tasks.length > 0 
        ? (project.tasks.filter(t => t.status === TaskStatus.Done).length / project.tasks.length) * 100 
        : 0;

    const overdueTasks = project.tasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done
    ).length;

    const getStatusChip = (status: ProjectStatus) => {
        const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
        switch (status) {
            case ProjectStatus.InProgress: return `${baseClasses} bg-blue-100 text-blue-800`;
            case ProjectStatus.Completed: return `${baseClasses} bg-green-100 text-green-800`;
            case ProjectStatus.OnHold: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        }
    }
    
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    }
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    }

    return (
        <Card 
            onClick={onSelect} 
            className={`cursor-pointer border-2 ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent hover:border-slate-300'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-800 truncate">{project.name}</h3>
                    <div className="mt-1">
                        <span className={getStatusChip(project.status)}>{project.status}</span>
                    </div>
                </div>
                 <div className="flex-shrink-0 flex items-center gap-1">
                    <button onClick={handleEditClick} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 hover:text-indigo-600 transition-colors" title="Editar Projeto">
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button onClick={handleDeleteClick} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-600 transition-colors" title="Excluir Projeto">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <p className="text-sm text-slate-600 mt-2 line-clamp-2 h-10">{project.description}</p>
            
            <div className="mt-4">
                <div className="flex justify-between items-center text-sm text-slate-600 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
                <div className="flex -space-x-2">
                    {project.team.slice(0, 4).map(member => (
                        <img key={member.id} src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full ring-2 ring-white" title={member.name}/>
                    ))}
                    {project.team.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-white text-xs font-medium text-slate-600">
                            +{project.team.length - 4}
                        </div>
                    )}
                </div>
                {overdueTasks > 0 && (
                    <div className="flex items-center text-red-600">
                        <AlertCircleIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">{overdueTasks} Atrasada{overdueTasks > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ProjectList: React.FC = () => {
    const { projects, addProject, updateProject, deleteProject } = useProjectContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(projects.length > 0 ? projects[0] : null);

    const handleAddProject = () => {
        setProjectToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = (projectId: string) => {
        if (window.confirm('Tem certeza de que deseja excluir este projeto? Todas as tarefas associadas também serão removidas.')) {
            deleteProject(projectId);
            if(selectedProject?.id === projectId) {
                const remainingProjects = projects.filter(p => p.id !== projectId);
                setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
            }
        }
    };
    
    const handleSaveProject = (projectData: Omit<Project, 'id'> | Project) => {
        if ('id' in projectData) {
            updateProject(projectData);
            if (selectedProject?.id === projectData.id) {
                setSelectedProject(projectData);
            }
        } else {
            addProject(projectData);
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Projetos</h2>
                        <p className="mt-1 text-slate-600">Selecione um projeto para ver seus detalhes ou adicione um novo.</p>
                    </div>
                    <button onClick={handleAddProject} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon className="h-4 w-4" />
                        <span>Novo Projeto</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map(project => (
                        <ProjectCard 
                            key={project.id}
                            project={project}
                            onSelect={() => setSelectedProject(project)}
                            onEdit={() => handleEditProject(project)}
                            onDelete={() => handleDeleteProject(project.id)}
                            isSelected={selectedProject?.id === project.id}
                        />
                    ))}
                </div>
                
                {projects.length > 0 ? (
                    selectedProject ? (
                        <ProjectDetail project={selectedProject} />
                    ) : (
                         <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-medium text-slate-800">Nenhum projeto selecionado</h3>
                            <p className="mt-2 text-slate-500">Selecione um projeto acima para ver os detalhes.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-slate-800">Nenhum projeto encontrado</h3>
                        <p className="mt-2 text-slate-500">Comece adicionando um novo projeto.</p>
                    </div>
                )}
            </div>
            
            <ProjectForm 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
            />
        </>
    );
};

export default ProjectList;
