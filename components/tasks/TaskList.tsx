
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import NotificationSenderModal from './NotificationSenderModal';
import TaskSummaryModal from './TaskSummaryModal';
import { PlusIcon } from '../ui/Icons';
import { GlobalRole } from '../../types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

type EnhancedTask = Task & {
  projectName: string;
};

interface TaskListProps {
  globalProjectFilter: string;
  setGlobalProjectFilter: (filter: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ globalProjectFilter, setGlobalProjectFilter }) => {
  const { projects, addTask, updateTask, deleteTask, reorderTasks, profile, getProjectRole } = useProjectContext();
  const [filterProjectId, setFilterProjectId] = useState<string>(globalProjectFilter);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<EnhancedTask | null>(null);
  const [taskToView, setTaskToView] = useState<EnhancedTask | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards'); // 'cards' é o padrão

  useEffect(() => {
    setFilterProjectId(globalProjectFilter);
  }, [globalProjectFilter]);

  const statuses = useMemo(() => Object.values(TaskStatus), []);

  const enhancedTasks = useMemo(() => {
    const tasks: EnhancedTask[] = projects.flatMap(p => 
      p.tasks.map(t => ({...t, projectName: p.name}))
    );
    if (filterProjectId === 'all') {
      return tasks;
    }
    return tasks.filter(t => t.project_id === filterProjectId);
  }, [projects, filterProjectId]);

  // Função auxiliar para ordenar tarefas por prioridade (Alta > Média > Baixa)
  const sortTasksByPriority = useCallback((tasks: EnhancedTask[]) => {
    const priorityOrder = {
      [TaskPriority.High]: 1,  // Alta (prioridade mais alta)
      [TaskPriority.Medium]: 2, // Média
      [TaskPriority.Low]: 3,   // Baixa (prioridade mais baixa)
    };
    
    return [...tasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, []);

  const buildColumns = useCallback(
    (tasks: EnhancedTask[]) => {
      const grouped = statuses.reduce((acc, status) => {
        acc[status] = [] as EnhancedTask[];
        return acc;
      }, {} as Record<TaskStatus, EnhancedTask[]>);

      tasks.forEach(task => {
        grouped[task.status].push(task);
      });
      
      // Ordenar cada coluna por prioridade
      statuses.forEach(status => {
        grouped[status] = sortTasksByPriority(grouped[status]);
      });

      return grouped;
    },
    [statuses, sortTasksByPriority]
  );

  const mergeColumns = useCallback(
    (
      previous: Record<TaskStatus, EnhancedTask[]>,
      tasks: EnhancedTask[]
    ): Record<TaskStatus, EnhancedTask[]> => {
      const grouped = buildColumns(tasks);
      const merged = {} as Record<TaskStatus, EnhancedTask[]>;

      statuses.forEach(status => {
        const prevList = previous?.[status] ?? [];
        const nextList = grouped[status];

        const ordered = prevList
          .map(prevTask => nextList.find(task => task.id === prevTask.id))
          .filter((task): task is EnhancedTask => Boolean(task));

        const remaining = nextList.filter(
          task => !ordered.some(orderedTask => orderedTask.id === task.id)
        );

        // Combinar as listas e reordenar por prioridade
        merged[status] = sortTasksByPriority([...ordered, ...remaining]);
      });

      return merged;
    },
    [buildColumns, statuses, sortTasksByPriority]
  );

  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, EnhancedTask[]>>(
    () => buildColumns(enhancedTasks)
  );

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setTasksByStatus(prev => mergeColumns(prev, enhancedTasks));
    }
  }, [enhancedTasks, mergeColumns, isDragging]);

  // Sensores desativados para remover a funcionalidade de drag and drop
  const sensors = useSensors();

  const findContainer = useCallback(
    (id: string): TaskStatus | undefined => {
      if (statuses.includes(id as TaskStatus)) {
        return id as TaskStatus;
      }

      return statuses.find(status =>
        tasksByStatus[status]?.some(task => task.id === id)
      );
    },
    [statuses, tasksByStatus]
  );

  // Função de drag start desativada
  const handleDragStart = useCallback(() => {
    // Funcionalidade de drag and drop desativada
    return;
  }, []);

  // Função de drag over desativada
  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      // Funcionalidade de drag and drop desativada
      return;
    },
    [findContainer]
  );

  // Função de drag end desativada
  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      // Funcionalidade de drag and drop desativada
      setIsDragging(false);
      return;
    },
    [findContainer, reorderTasks, tasksByStatus, updateTask]
  );

  const handleEditTask = (task: EnhancedTask) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const handleViewTask = (task: EnhancedTask) => {
    setTaskToView(task);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => {
    try {
      if (taskToEdit) {
        // Obter o assignee atual da tarefa
        const assignee = projects.flatMap(p => p.tasks).find(t => t.id === taskToEdit.id)?.assignee;
        
        // Criar o objeto de tarefa atualizado
        const updatedTask = { ...taskToEdit, ...taskData, assignee, assignee_id: taskData.assignee_id };
        
        // Atualizar a tarefa no servidor
        await updateTask(updatedTask);
        
        // Atualizar o estado local imediatamente para refletir a mudança
        // Isso garante que a tarefa editada seja corretamente refletida antes da ordenação
        setTasksByStatus(prev => {
          const newState = { ...prev };
          
          // Remover a tarefa da coluna antiga se o status foi alterado
          if (taskToEdit.status !== updatedTask.status) {
            newState[taskToEdit.status] = newState[taskToEdit.status].filter(t => t.id !== updatedTask.id);
          }
          
          // Atualizar ou adicionar a tarefa na coluna correta
          newState[updatedTask.status] = sortTasksByPriority(
            newState[updatedTask.status].map(t => t.id === updatedTask.id ? updatedTask : t)
          );
          
          // Se a tarefa não existia na coluna (mudou de status), adicioná-la
          if (!newState[updatedTask.status].some(t => t.id === updatedTask.id)) {
            newState[updatedTask.status] = sortTasksByPriority([...newState[updatedTask.status], updatedTask]);
          }
          
          return newState;
        });
      } else {
        // Adicionar nova tarefa
        await addTask(taskData);
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa. Por favor, tente novamente.');
    } finally {
      // Fechar o formulário e limpar o estado de edição
      setIsFormOpen(false);
      setTaskToEdit(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setFilterProjectId(newProjectId);
    setGlobalProjectFilter(newProjectId);
  };

  const isGlobalAdmin = profile?.role === GlobalRole.Admin;
  const canEditTask = (task: EnhancedTask) => {
    if (isGlobalAdmin) return true;
    const role = getProjectRole(task.project_id);
    if (role === undefined) {
      // Sem informação de equipe? Permite edição para não bloquear admins locais.
      return true;
    }
    return role === 'admin' || role === 'editor';
  };
  
  return (
    <div className="space-y-6">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Quadro de Tarefas</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Visualize e gerencie tarefas no formato Kanban.</p>
        </div>
        <div className="flex gap-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:border dark:border-indigo-500/30 transition-colors"
            >
                Lembrete de Tarefas
            </button>
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:text-slate-100 dark:bg-slate-700/40 dark:hover:bg-slate-700/70 dark:border dark:border-slate-600/60 transition-colors"
            >
                Resumo
            </button>
            <button onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
              <PlusIcon className="h-5 w-5" />
              <span>Nova Tarefa</span>
            </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label htmlFor="project-filter" className="text-sm font-medium text-slate-700 dark:text-slate-200">Filtrar por Projeto:</label>
          <select
            id="project-filter"
            value={filterProjectId}
            onChange={handleFilterChange}
            className="block w-full max-w-xs border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900 placeholder-slate-500 dark:bg-slate-800/80 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="all">Todos os Projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
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
      </div>

      {viewMode === 'cards' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statuses.map(status => (
              <div key={status}>
                <KanbanColumn
                  status={status}
                  tasks={tasksByStatus[status] ?? []}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onViewTask={handleViewTask}
                  canEditTask={canEditTask}
                />
              </div>
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="space-y-8">
          {statuses.map(status => {
            const tasks = tasksByStatus[status] ?? [];
            if (tasks.length === 0) return null;
            
            return (
              <div key={status} className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                    {status} <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">({tasks.length})</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewTask(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">{task.name}</h4>
                          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 truncate">{task.projectName}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            {task.assignee ? (
                              <img 
                                src={task.assignee.avatar} 
                                alt={task.assignee.name} 
                                className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800"
                                title={task.assignee.name}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300">
                                <span className="text-xs font-medium">N/A</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.priority === TaskPriority.High ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200' :
                              task.priority === TaskPriority.Medium ? 'bg-yellow-100 text-yellow-800 dark:bg-amber-500/20 dark:text-amber-200' :
                              'bg-blue-100 text-blue-800 dark:bg-sky-500/20 dark:text-sky-200'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {canEditTask(task) && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="Editar tarefa"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Excluir tarefa"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        initialProjectId={filterProjectId !== 'all' ? filterProjectId : undefined}
      />
      <TaskSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        projectId={filterProjectId !== 'all' ? filterProjectId : undefined}
      />
    </div>
  );
};

export default TaskList;