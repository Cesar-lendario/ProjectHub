import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus, Task } from '../../types';
import Card from '../ui/Card';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import { EditIcon, TrashIcon } from '../ui/Icons';

interface ChecklistViewProps {
  globalProjectFilter: string;
  setGlobalProjectFilter: (filter: string) => void;
}

type EnhancedTask = Task & {
  projectId: string;
  projectName: string;
};

const ChecklistView: React.FC<ChecklistViewProps> = ({ globalProjectFilter, setGlobalProjectFilter }) => {
  const { projects, updateTask, deleteTask } = useProjectContext();
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<EnhancedTask | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<EnhancedTask | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Coletar todas as tarefas dos projetos
  const allTasks = useMemo(() => {
    let tasks = projects.flatMap(project =>
      project.tasks.map(task => {
        // Garantir que o ID existe
        if (!task.id) {
          console.error('[ChecklistView] ❌ Tarefa sem ID encontrada:', task);
        }
        return {
          ...task,
          projectId: project.id,
          projectName: project.name,
        };
      })
    );

    // Filtrar tarefas sem ID para evitar erros
    tasks = tasks.filter(task => {
      if (!task.id) {
        console.warn('[ChecklistView] ⚠️ Ignorando tarefa sem ID:', task.name);
        return false;
      }
      return true;
    });

    // Aplicar filtro de projeto
    if (globalProjectFilter !== 'all') {
      tasks = tasks.filter(task => task.projectId === globalProjectFilter);
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      tasks = tasks.filter(task => task.status === statusFilter);
    }

    // Ordenar
    if (sortBy === 'name') {
      tasks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'status') {
      const statusOrder = {
        [TaskStatus.Pending]: 0,
        [TaskStatus.ToDo]: 1,
        [TaskStatus.InProgress]: 2,
        [TaskStatus.Done]: 3,
      };
      tasks.sort((a, b) => statusOrder[a.status as TaskStatus] - statusOrder[b.status as TaskStatus]);
    }

    return tasks;
  }, [projects, globalProjectFilter, statusFilter, sortBy]);

  // Função para atualizar o status da tarefa
  const handleStatusChange = async (task: EnhancedTask, newStatus: TaskStatus) => {
    // Prevenir cliques múltiplos
    if (updatingTaskId === task.id) {
      console.log('[ChecklistView] ⚠️ Atualização já em andamento para esta tarefa');
      return;
    }
    
    // Validar se a tarefa tem ID
    if (!task.id) {
      console.error('[ChecklistView] ❌ Tentando atualizar tarefa sem ID:', task);
      return;
    }
    
    try {
      setUpdatingTaskId(task.id);
      console.log(`[ChecklistView] 📝 Mudando status de "${task.name}" de ${task.status} para ${newStatus}`);
      
      // A função updateTask do useProjectContext espera apenas o objeto Task completo
      const updatedTask = {
        ...task,
        status: newStatus,
        project_id: task.projectId,
      };
      
      await updateTask(updatedTask);
      console.log(`[ChecklistView] ✅ Status atualizado com sucesso`);
    } catch (error) {
      console.error('[ChecklistView] ❌ Erro ao atualizar status da tarefa:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Função para abrir modal da tarefa
  const handleTaskClick = (task: EnhancedTask, e: React.MouseEvent) => {
    // Ignorar clique se for nos checkboxes ou botões
    const target = e.target as HTMLElement;
    if (target.type === 'checkbox' || target.closest('button')) {
      return;
    }
    setSelectedTask(task);
  };

  // Função para editar tarefa
  const handleEditTask = (task: EnhancedTask) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  // Função para excluir tarefa
  const handleDeleteTask = (task: EnhancedTask) => {
    setTaskToDelete(task);
  };

  // Confirmar exclusão
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      console.log('[ChecklistView] 🗑️ Excluindo tarefa:', {
        taskId: taskToDelete.id,
        taskName: taskToDelete.name,
        projectId: taskToDelete.projectId
      });
      
      await deleteTask(taskToDelete.id);
      
      console.log('[ChecklistView] ✅ Tarefa excluída com sucesso');
      setTaskToDelete(null);
    } catch (error) {
      console.error('[ChecklistView] ❌ Erro ao excluir tarefa:', error);
      alert('Erro ao excluir tarefa. Tente novamente.');
    }
  };

  // Salvar tarefa editada
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => {
    try {
      if (taskToEdit) {
        // Atualizar tarefa existente
        const updatedTask = {
          ...taskToEdit,
          ...taskData,
          project_id: taskToEdit.projectId,
        };
        await updateTask(updatedTask);
      }
      setIsFormOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('[ChecklistView] Erro ao salvar tarefa:', error);
      alert('Erro ao salvar tarefa. Tente novamente.');
    }
  };

  // Função para imprimir a lista
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4" id="checklist-print-area">
      {/* Cabeçalho para impressão - visível apenas ao imprimir */}
      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">
          Lista de Verificação - TaskMeet
        </h1>
        <div className="text-sm text-gray-600 mb-1">
          <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        {globalProjectFilter !== 'all' && (
          <div className="text-sm text-gray-600 mb-1">
            <strong>Projeto:</strong> {projects.find(p => p.id === globalProjectFilter)?.name || 'N/A'}
          </div>
        )}
        {statusFilter !== 'all' && (
          <div className="text-sm text-gray-600 mb-1">
            <strong>Status:</strong> {statusFilter}
          </div>
        )}
        <div className="text-sm text-gray-600">
          <strong>Total de tarefas:</strong> {allTasks.length}
        </div>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Lista de Verificação
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Visualize e atualize o status das tarefas rapidamente
          </p>
        </div>
        
        {/* Botão Imprimir - Oculto na impressão */}
        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          title="Imprimir lista"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Imprimir Lista</span>
        </button>
      </div>

      {/* Filtros - Ocultos na impressão */}
      <Card className="print:hidden">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro de Projeto */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filtrar por Projeto
            </label>
            <select
              value={globalProjectFilter}
              onChange={(e) => setGlobalProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="all">Todos os Projetos</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filtrar por Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="all">Todos os Status</option>
              <option value={TaskStatus.Pending}>Pendente</option>
              <option value={TaskStatus.ToDo}>A Fazer</option>
              <option value={TaskStatus.InProgress}>Em Andamento</option>
              <option value={TaskStatus.Done}>Concluído</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'status')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="name">Nome da Tarefa (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Tarefas */}
      <Card>
        {allTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              Nenhuma tarefa encontrada com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header da tabela */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="col-span-3">Tarefa</div>
              <div className="col-span-3 hidden md:block">Descrição</div>
              <div className="col-span-4 text-center">Status</div>
              <div className="col-span-2 text-center print:hidden">Ações</div>
            </div>

            {/* Linhas de tarefas */}
            {allTasks.map(task => (
              <div
                key={task.id}
                onClick={(e) => handleTaskClick(task, e)}
                className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {/* Nome da Tarefa */}
                <div className="col-span-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {task.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {task.projectName}
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                <div className="col-span-3 hidden md:block">
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {task.description || 'Sem descrição'}
                  </p>
                </div>

                {/* Checkboxes de Status */}
                <div className="col-span-4 flex items-center justify-around gap-2">
                  {/* Pendente */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.status === TaskStatus.Pending}
                        onChange={() => handleStatusChange(task, TaskStatus.Pending)}
                        disabled={updatingTaskId === task.id}
                        className="w-5 h-5 rounded border-2 cursor-pointer transition-all appearance-none
                          checked:bg-red-500 checked:border-red-500
                          unchecked:bg-white unchecked:border-slate-300 dark:unchecked:bg-slate-700 dark:unchecked:border-slate-600
                          hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pendente"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {task.status === TaskStatus.Pending && (
                        <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                      Pendente
                    </span>
                  </div>

                  {/* A Fazer */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.status === TaskStatus.ToDo}
                        onChange={() => handleStatusChange(task, TaskStatus.ToDo)}
                        disabled={updatingTaskId === task.id}
                        className="w-5 h-5 rounded border-2 cursor-pointer transition-all appearance-none
                          checked:bg-yellow-500 checked:border-yellow-500
                          unchecked:bg-white unchecked:border-slate-300 dark:unchecked:bg-slate-700 dark:unchecked:border-slate-600
                          hover:border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="A Fazer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {task.status === TaskStatus.ToDo && (
                        <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">
                      A Fazer
                    </span>
                  </div>

                  {/* Em Andamento */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.status === TaskStatus.InProgress}
                        onChange={() => handleStatusChange(task, TaskStatus.InProgress)}
                        disabled={updatingTaskId === task.id}
                        className="w-5 h-5 rounded border-2 cursor-pointer transition-all appearance-none
                          checked:bg-blue-500 checked:border-blue-500
                          unchecked:bg-white unchecked:border-slate-300 dark:unchecked:bg-slate-700 dark:unchecked:border-slate-600
                          hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Em Andamento"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {task.status === TaskStatus.InProgress && (
                        <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                      Em Andamento
                    </span>
                  </div>

                  {/* Concluído */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.status === TaskStatus.Done}
                        onChange={() => handleStatusChange(task, TaskStatus.Done)}
                        disabled={updatingTaskId === task.id}
                        className="w-5 h-5 rounded border-2 cursor-pointer transition-all appearance-none
                          checked:bg-green-500 checked:border-green-500
                          unchecked:bg-white unchecked:border-slate-300 dark:unchecked:bg-slate-700 dark:unchecked:border-slate-600
                          hover:border-green-400 focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Concluído"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {task.status === TaskStatus.Done && (
                        <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                      Concluído
                    </span>
                  </div>
                </div>

                {/* Ações: Editar e Excluir - Ocultos na impressão */}
                <div className="col-span-2 flex items-center justify-center gap-2 print:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar tarefa"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task);
                    }}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir tarefa"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contador - Oculto na impressão */}
      <div className="text-sm text-slate-500 dark:text-slate-400 text-center print:hidden">
        Exibindo {allTasks.length} tarefa(s)
      </div>

      {/* Rodapé para impressão - visível apenas ao imprimir */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500 text-center">
          Documento gerado pelo TaskMeet - www.taskmeet.com.br
        </p>
      </div>

      {/* Modal de Detalhes da Tarefa */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Modal de Edição de Tarefa */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialProjectId={taskToEdit?.projectId}
      />

      {/* Modal de Confirmação de Exclusão */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskToDelete(null)}>
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Tem certeza que deseja excluir a tarefa <strong>"{taskToDelete.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistView;

