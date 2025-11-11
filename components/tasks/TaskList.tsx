// Fix: Implemented the TaskList component as a Kanban board.
import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import { PlusIcon, UsersIcon } from '../ui/Icons';
import NotificationSenderModal from './NotificationSenderModal';
import NotificationLogTable from './NotificationLogTable';
import TeamManagementModal from '../team/TeamManagementModal'; // Import the new modal

type EnhancedTask = Task & {
  projectName: string;
};

const TaskList: React.FC = () => {
  const { projects, addTask, updateTask, deleteTask, getProjectRole } = useProjectContext();
  const { profile } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false); // State for the new modal
  const [taskToEdit, setTaskToEdit] = useState<EnhancedTask | null>(null);
  const [filterProject, setFilterProject] = useState<string>(projects[0]?.id || 'all');

  const selectedProject = useMemo(() => projects.find(p => p.id === filterProject), [projects, filterProject]);
  
  const userRoleInProject = selectedProject ? getProjectRole(selectedProject.id) : null;
  const isGlobalAdmin = profile?.role === 'admin';
  const canEdit = isGlobalAdmin || userRoleInProject === 'admin' || userRoleInProject === 'editor';
  const canManageTeam = isGlobalAdmin || userRoleInProject === 'admin';

  const allTasks = useMemo(() => {
    return projects.flatMap(p => 
        p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
    );
  }, [projects]);

  const filteredTasks = useMemo(() => {
    if (filterProject === 'all' || !selectedProject) return allTasks;
    return allTasks.filter(t => t.projectId === filterProject);
  }, [allTasks, filterProject, selectedProject]);
  
  const tasksByStatus = useMemo(() => {
    return Object.values(TaskStatus).reduce((acc, status) => {
        acc[status] = filteredTasks.filter(task => task.status === status);
        return acc;
    }, {} as Record<TaskStatus, EnhancedTask[]>);
  }, [filteredTasks]);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: EnhancedTask) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task", error);
        alert(error instanceof Error ? error.message : "Could not delete task.");
      }
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'|'assignee'|'comments'|'attachments'|'assignee_id'>) => {
    try {
      if (taskToEdit) {
          await updateTask({...taskData, id: taskToEdit.id });
      } else {
          await addTask(taskData);
      }
      setIsTaskFormOpen(false);
    } catch (error) {
      console.error("Failed to save task", error);
      alert(error instanceof Error ? error.message : "Could not save task.");
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Quadro de Tarefas</h1>
                <p className="mt-1 text-slate-600">Visualize e gerencie todas as tarefas em um só lugar.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                 <button onClick={() => setIsNotificationModalOpen(true)} className="px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700">
                    Enviar Lembrete
                </button>
                {canManageTeam && selectedProject && (
                  <button onClick={() => setIsTeamModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg shadow-sm hover:bg-slate-800">
                    <UsersIcon className="h-4 w-4" />
                    <span>Gerenciar Equipe</span>
                  </button>
                )}
                {canEdit && (
                  <button onClick={handleAddTask} className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                      <PlusIcon className="h-4 w-4" />
                      <span>Adicionar Tarefa</span>
                  </button>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <label htmlFor="project-filter" className="text-sm font-medium text-slate-700">Filtrar por Projeto:</label>
            <select
                id="project-filter"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="block border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
            >
                <option value="all">Todos os Projetos</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {Object.values(TaskStatus).map(status => (
                <KanbanColumn 
                    key={status} 
                    status={status} 
                    tasks={tasksByStatus[status]} 
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask} 
                    canEdit={canEdit} />
            ))}
        </div>

        <div className="mt-8">
            <NotificationLogTable />
        </div>

        <TaskForm
            isOpen={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            onSave={handleSaveTask}
            taskToEdit={taskToEdit}
            initialProjectId={filterProject !== 'all' ? filterProject : undefined}
        />

        <NotificationSenderModal 
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
        />
        
        {selectedProject && (
            <TeamManagementModal 
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                project={selectedProject}
            />
        )}
    </div>
  );
};

export default TaskList;
