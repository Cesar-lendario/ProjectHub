
import React, { useState, useMemo, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import NotificationSenderModal from './NotificationSenderModal';
import { PlusIcon } from '../ui/Icons';
import { GlobalRole } from '../../types';

type EnhancedTask = Task & {
  projectName: string;
};

interface TaskListProps {
  globalProjectFilter: string;
  setGlobalProjectFilter: (filter: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ globalProjectFilter, setGlobalProjectFilter }) => {
  const { projects, addTask, updateTask, deleteTask, profile, getProjectRole } = useProjectContext();
  const [filterProjectId, setFilterProjectId] = useState<string>(globalProjectFilter);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<EnhancedTask | null>(null);
  const [taskToView, setTaskToView] = useState<EnhancedTask | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    setFilterProjectId(globalProjectFilter);
  }, [globalProjectFilter]);

  const enhancedTasks = useMemo(() => {
    const tasks: EnhancedTask[] = projects.flatMap(p => 
      p.tasks.map(t => ({...t, projectName: p.name}))
    );
    if (filterProjectId === 'all') {
      return tasks;
    }
    return tasks.filter(t => t.project_id === filterProjectId);
  }, [projects, filterProjectId]);

  const columns: TaskStatus[] = Object.values(TaskStatus);

  const handleEditTask = (task: EnhancedTask) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => {
    if (taskToEdit) {
        const assignee = projects.flatMap(p => p.tasks).find(t => t.id === taskToEdit.id)?.assignee;
        const updatedTask = { ...taskToEdit, ...taskData, assignee, assignee_id: taskData.assignee_id };
        await updateTask(updatedTask);
    } else {
        await addTask(taskData);
    }
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setFilterProjectId(newProjectId);
    setGlobalProjectFilter(newProjectId);
  };

  const isGlobalAdmin = profile?.role === GlobalRole.Admin;
  const projectRole = getProjectRole(filterProjectId);
  const canEditProject = isGlobalAdmin || projectRole === 'admin' || projectRole === 'editor';
  
  return (
    <div className="space-y-6">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Quadro de Tarefas</h1>
            <p className="mt-1 text-slate-600">Visualize e gerencie tarefas no formato Kanban.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsNotificationModalOpen(true)} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                Lembrete de Tarefas
            </button>
            <button onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
              <PlusIcon className="h-5 w-5" />
              <span>Nova Tarefa</span>
            </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <label htmlFor="project-filter" className="text-sm font-medium text-slate-700">Filtrar por Projeto:</label>
        <select
          id="project-filter"
          value={filterProjectId}
          onChange={handleFilterChange}
          className="block w-full max-w-xs border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900"
        >
          <option value="all">Todos os Projetos</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={enhancedTasks.filter(t => t.status === status)}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            canEdit={canEditProject}
          />
        ))}
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialProjectId={filterProjectId !== 'all' ? filterProjectId : undefined}
      />
      {taskToView && (
        <TaskDetail
            task={taskToView}
            isOpen={!!taskToView}
            onClose={() => setTaskToView(null)}
        />
      )}
       <NotificationSenderModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
       />
    </div>
  );
};

export default TaskList;