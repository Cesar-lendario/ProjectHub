import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { PlusIcon } from '../ui/Icons';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import KanbanColumn from './KanbanColumn';
import NotificationSenderModal from './NotificationSenderModal';
import NotificationLogTable from './NotificationLogTable';

export type EnhancedTask = Task & {
  projectName: string;
  projectId: string;
};

const TaskList: React.FC = () => {
    const { projects, users, addTask, updateTask, deleteTask } = useProjectContext();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<EnhancedTask | null>(null);
    const [viewingTask, setViewingTask] = useState<EnhancedTask | null>(null);
    
    // State for filters and sorting
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterProject, setFilterProject] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('default');

    const allTasks = useMemo((): EnhancedTask[] => {
        return projects.flatMap(p => 
            p.tasks.map(t => ({
                ...t,
                projectName: p.name,
                projectId: p.id,
            }))
        );
    }, [projects]);

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = allTasks;

        if (filterAssignee !== 'all') {
            filtered = filtered.filter(task => task.assignee?.id === filterAssignee);
        }
        if (filterProject !== 'all') {
            filtered = filtered.filter(task => task.projectId === filterProject);
        }
        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        if (sortBy === 'default') {
            return filtered;
        }
        
        const sorted = [...filtered];

        if (sortBy === 'dueDate') {
            sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        } else if (sortBy === 'priority') {
            const priorityOrder = { [TaskPriority.High]: 0, [TaskPriority.Medium]: 1, [TaskPriority.Low]: 2 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        return sorted;
    }, [allTasks, filterAssignee, filterProject, filterPriority, sortBy]);

    const handleClearFilters = () => {
        setFilterAssignee('all');
        setFilterProject('all');
        setFilterPriority('all');
        setSortBy('default');
    };

    const handleAddTaskClick = () => {
        setEditingTask(null);
        setIsFormModalOpen(true);
    };

    const handleEditTaskClick = (task: EnhancedTask) => {
        setEditingTask(task);
        setIsFormModalOpen(true);
    };
    
    const handleViewTaskClick = (task: EnhancedTask) => {
        setViewingTask(task);
        setIsDetailModalOpen(true);
    };

    const handleDeleteTaskClick = (task: EnhancedTask) => {
        if(window.confirm(`Tem certeza de que deseja excluir a tarefa "${task.name}"?`)) {
            deleteTask(task.projectId, task.id);
        }
    };
    
    const handleEditFromDetail = (task: EnhancedTask) => {
        setIsDetailModalOpen(false);
        handleEditTaskClick(task);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'assignee'> & { assignee: string | null; projectId: string }) => {
        const { projectId, ...restTaskData } = taskData;
        const assignee = users.find(u => u.id === restTaskData.assignee) || null;
        
        const finalTaskData = {
            ...restTaskData,
            assignee,
            comments: editingTask?.comments || [],
            attachments: editingTask?.attachments || [],
            dependencies: editingTask?.dependencies || [],
        };
        
        if (editingTask) {
            updateTask(projectId, { ...finalTaskData, id: editingTask.id });
        } else {
            addTask(projectId, finalTaskData);
        }
        setIsFormModalOpen(false);
    };

    const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const projectId = e.dataTransfer.getData('projectId');
        
        const taskToMove = allTasks.find(t => t.id === taskId);

        if (taskToMove && taskToMove.status !== newStatus) {
            updateTask(projectId, { ...taskToMove, status: newStatus });
        }
    };

    const columns: TaskStatus[] = [TaskStatus.Pending, TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];

    return (
        <>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Quadro Kanban de Tarefas</h2>
                            <p className="mt-1 text-slate-600">Filtre, ordene e mova as tarefas para gerenciar o fluxo de trabalho.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsNotificationModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg shadow-sm hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span>E-mail/Whatsapp</span>
                            </button>
                            <button onClick={handleAddTaskClick} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <PlusIcon className="h-4 w-4" />
                                <span>Adicionar Tarefa</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Filters */}
                        <div>
                            <label htmlFor="filter-assignee" className="block text-xs font-medium text-slate-600">Responsável</label>
                            <select id="filter-assignee" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white">
                                <option value="all">Todos</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="filter-project" className="block text-xs font-medium text-slate-600">Projeto</label>
                            <select id="filter-project" value={filterProject} onChange={e => setFilterProject(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white">
                                <option value="all">Todos</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="filter-priority" className="block text-xs font-medium text-slate-600">Prioridade</label>
                            <select id="filter-priority" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white">
                                <option value="all">Todas</option>
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        {/* Sorting */}
                         <div>
                            <label htmlFor="sort-by" className="block text-xs font-medium text-slate-600">Ordenar por</label>
                            <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white">
                                <option value="default">Padrão</option>
                                <option value="dueDate">Data de Vencimento</option>
                                <option value="priority">Prioridade</option>
                            </select>
                        </div>
                        {/* Clear Button */}
                         <div className="self-end">
                            <button onClick={handleClearFilters} className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1.5 rounded-md hover:bg-indigo-50">Limpar Filtros</button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {columns.map(status => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={filteredAndSortedTasks.filter(task => task.status === status)}
                            onDrop={handleDrop}
                            onViewTask={handleViewTaskClick}
                            onEditTask={handleEditTaskClick}
                            onDeleteTask={handleDeleteTaskClick}
                        />
                    ))}
                </div>
                 {filteredAndSortedTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow h-64">
                        <p className="text-center text-slate-500">Nenhuma tarefa corresponde aos filtros selecionados.</p>
                    </div>
                 )}
                <div>
                    <NotificationLogTable />
                </div>
            </div>
            <TaskForm 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={editingTask}
            />
            <TaskDetail
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onEdit={handleEditFromDetail}
                task={viewingTask}
            />
            <NotificationSenderModal 
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
            />
        </>
    );
};

export default TaskList;