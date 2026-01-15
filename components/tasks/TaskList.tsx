
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import NotificationSenderModal from './NotificationSenderModal';
import TaskSummaryModal from './TaskSummaryModal';
import ProjectConditionModal from './ProjectConditionModal';
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
  // Começar sem projeto selecionado se vier do sidebar (globalProjectFilter vazio ou 'all')
  const [filterProjectId, setFilterProjectId] = useState<string>(
    globalProjectFilter && globalProjectFilter !== 'all' ? globalProjectFilter : ''
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<EnhancedTask | null>(null);
  const [taskToView, setTaskToView] = useState<EnhancedTask | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards'); // 'cards' é o padrão
  const [activeTab, setActiveTab] = useState<TaskStatus>(TaskStatus.Pending); // Aba ativa no modo lista

  useEffect(() => {
    // Só atualizar se o filtro global for um projeto específico (não 'all' ou vazio)
    if (globalProjectFilter && globalProjectFilter !== 'all') {
      setFilterProjectId(globalProjectFilter);
    }
  }, [globalProjectFilter]);

  const statuses = useMemo(() => Object.values(TaskStatus), []);

  // Verificar se há um projeto selecionado
  const hasProjectSelected = filterProjectId && filterProjectId !== '' && filterProjectId !== 'all';

  const enhancedTasks = useMemo(() => {
    // Se não há projeto selecionado, retornar array vazio
    if (!hasProjectSelected) {
      return [];
    }

    const tasks: EnhancedTask[] = projects.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.name }))
    );
    return tasks.filter(t => t.project_id === filterProjectId);
  }, [projects, filterProjectId, hasProjectSelected]);

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

  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, EnhancedTask[]>>(() => {
    const empty: Record<TaskStatus, EnhancedTask[]> = {} as Record<TaskStatus, EnhancedTask[]>;
    Object.values(TaskStatus).forEach(status => {
      empty[status] = [];
    });
    return empty;
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setTasksByStatus(prev => mergeColumns(prev, enhancedTasks));
    }
  }, [enhancedTasks, mergeColumns, isDragging]);

  // Quando mudar para modo lista, definir a primeira aba com tarefas como ativa
  useEffect(() => {
    if (viewMode === 'list') {
      const firstStatusWithTasks = statuses.find(status => {
        const tasks = tasksByStatus[status] ?? [];
        return tasks.length > 0;
      });
      if (firstStatusWithTasks) {
        setActiveTab(firstStatusWithTasks);
      }
    }
  }, [viewMode, tasksByStatus, statuses]);

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
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.error('[TaskList] ⚠️ Timeout ao salvar tarefa após', elapsed, 'segundos');

      // Verificar se é problema de conexão ou servidor
      const errorMsg = 'A operação está demorando muito (' + elapsed + 's). Isso pode indicar:\n\n• Problema de conexão com a internet\n• Servidor sobrecarregado\n• Token de autenticação expirado\n• Cache do navegador corrompido\n\nPor favor:\n1. Verifique sua conexão\n2. Recarregue a página (Ctrl+Shift+R)\n3. Tente novamente\n\nSe o problema persistir, limpe o cache do navegador completamente.';

      alert(errorMsg);

      // Fechar modal mesmo em caso de timeout
      setIsFormOpen(false);
      setTaskToEdit(null);
    }, 20000); // 20 segundos de timeout (reduzido de 30s)

    try {
      console.log('[TaskList] Iniciando salvamento...', {
        isEdit: !!taskToEdit,
        taskId: taskToEdit?.id,
        taskData
      });

      if (taskToEdit) {
        // Obter o assignee atual da tarefa
        const assignee = projects.flatMap(p => p.tasks).find(t => t.id === taskToEdit.id)?.assignee;

        // Criar o objeto de tarefa atualizado
        const updatedTask = { ...taskToEdit, ...taskData, assignee, assignee_id: taskData.assignee_id };

        console.log('[TaskList] Atualizando tarefa no servidor...', updatedTask.id);

        // Atualizar a tarefa no servidor
        await updateTask(updatedTask);

        console.log('[TaskList] ✅ Tarefa atualizada no servidor');

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
        console.log('[TaskList] Criando nova tarefa...');
        // Adicionar nova tarefa
        await addTask(taskData);
        console.log('[TaskList] ✅ Nova tarefa criada');
      }

      clearTimeout(timeoutId);
      console.log('[TaskList] Salvamento concluído com sucesso');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[TaskList] ❌ Erro ao salvar tarefa:', error);

      // Tratamento específico para erros de autenticação
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar tarefa. Por favor, tente novamente.';

      if (errorMessage.includes('Sessão expirada') || errorMessage.includes('expired') || errorMessage.includes('401')) {
        alert('Sua sessão expirou. A página será recarregada para renovar a autenticação.');
        window.location.reload();
        return;
      }

      alert(errorMessage);
      // Não fechar o modal em caso de erro para permitir correção
      throw error; // Re-throw para que o TaskForm possa tratar
    } finally {
      // Sempre fechar o formulário e limpar o estado de edição
      // Mesmo em caso de erro, fechamos para evitar estado inconsistente
      setIsFormOpen(false);
      setTaskToEdit(null);
      console.log('[TaskList] Modal fechado e estado limpo');
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
            onClick={() => setIsConditionModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 dark:text-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border dark:border-emerald-500/30 transition-colors"
          >
            Condição Atual
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
          <label htmlFor="project-filter" className="text-sm font-medium text-slate-700 dark:text-slate-200">Selecione o Projeto:</label>
          <select
            id="project-filter"
            value={filterProjectId}
            onChange={handleFilterChange}
            className="block w-full max-w-xs border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900 placeholder-slate-500 dark:bg-slate-800/80 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors"
          >
            <option value="">-- Selecione um projeto --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {hasProjectSelected && (
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
        )}
      </div>

      {/* Mensagem quando não há projeto selecionado */}
      {!hasProjectSelected ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-full p-6 mb-6">
            <svg className="w-16 h-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Selecione um Projeto</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
            Para visualizar as tarefas, selecione um projeto no campo acima.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{projects.length} projeto(s) disponível(is)</span>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          {/* Abas Horizontais */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-1 px-4" aria-label="Tabs">
              {statuses.map(status => {
                const tasks = tasksByStatus[status] ?? [];
                const isActive = activeTab === status;

                // Mapear cores para cada status
                const tabColors: { [key: string]: { active: string; inactive: string; border: string } } = {
                  'Pendente': {
                    active: 'text-red-600 dark:text-red-400 border-red-500',
                    inactive: 'text-red-500 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-400',
                    border: 'border-red-500'
                  },
                  'A Fazer': {
                    active: 'text-yellow-600 dark:text-yellow-400 border-yellow-500',
                    inactive: 'text-yellow-500 dark:text-yellow-500/70 hover:text-yellow-600 dark:hover:text-yellow-400',
                    border: 'border-yellow-500'
                  },
                  'Em andamento': {
                    active: 'text-blue-600 dark:text-blue-400 border-blue-500',
                    inactive: 'text-blue-500 dark:text-blue-500/70 hover:text-blue-600 dark:hover:text-blue-400',
                    border: 'border-blue-500'
                  },
                  'Concluído': {
                    active: 'text-green-600 dark:text-green-400 border-green-500',
                    inactive: 'text-green-500 dark:text-green-500/70 hover:text-green-600 dark:hover:text-green-400',
                    border: 'border-green-500'
                  }
                };

                const colors = tabColors[status] || {
                  active: 'text-indigo-600 dark:text-indigo-400 border-indigo-500',
                  inactive: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                  border: 'border-indigo-500'
                };

                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`
                      px-4 py-3 text-sm font-medium border-b-2 transition-colors
                      ${isActive
                        ? `${colors.active} ${colors.border}`
                        : `${colors.inactive} border-transparent`
                      }
                    `}
                  >
                    {status}
                    {tasks.length > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                        ? 'bg-slate-100 dark:bg-slate-700'
                        : 'bg-slate-200 dark:bg-slate-700/50'
                        }`}>
                        {tasks.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {(() => {
              const tasks = tasksByStatus[activeTab] ?? [];

              if (tasks.length === 0) {
                return (
                  <div className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Nenhuma tarefa com status "{activeTab}" encontrada.</p>
                  </div>
                );
              }

              // Mapear bordas laterais coloridas para cada status
              const statusBorders: { [key: string]: string } = {
                'Pendente': 'border-l-4 border-red-500',
                'A Fazer': 'border-l-4 border-yellow-500',
                'Em andamento': 'border-l-4 border-blue-500',
                'Concluído': 'border-l-4 border-green-500'
              };

              return tasks.map(task => (
                <div
                  key={task.id}
                  className={`px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${statusBorders[activeTab] || ''}`}
                  onClick={() => handleViewTask(task)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">{task.name}</h4>
                      <p className="mt-0.5 text-sm text-indigo-600 dark:text-indigo-400 truncate">{task.projectName}</p>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                      )}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.priority === TaskPriority.High ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200' :
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
              ));
            })()}
          </div>
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialProjectId={hasProjectSelected ? filterProjectId : undefined}
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
        initialProjectId={hasProjectSelected ? filterProjectId : undefined}
      />
      <TaskSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        projectId={hasProjectSelected ? filterProjectId : undefined}
      />
      <ProjectConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        projectId={hasProjectSelected ? filterProjectId : undefined}
      />
    </div>
  );
};

export default TaskList;