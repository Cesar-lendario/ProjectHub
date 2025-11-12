
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import NotificationSenderModal from './NotificationSenderModal';
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

  const buildColumns = useCallback(
    (tasks: EnhancedTask[]) => {
      const grouped = statuses.reduce((acc, status) => {
        acc[status] = [] as EnhancedTask[];
        return acc;
      }, {} as Record<TaskStatus, EnhancedTask[]>);

      tasks.forEach(task => {
        grouped[task.status].push(task);
      });

      return grouped;
    },
    [statuses]
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

        merged[status] = [...ordered, ...remaining];
      });

      return merged;
    },
    [buildColumns, statuses]
  );

  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, EnhancedTask[]>>(
    () => buildColumns(enhancedTasks)
  );

  useEffect(() => {
    setTasksByStatus(prev => mergeColumns(prev, enhancedTasks));
  }, [enhancedTasks, mergeColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const sourceStatus = findContainer(activeId);
      const targetStatus = findContainer(overId);

      if (!sourceStatus || !targetStatus || sourceStatus === targetStatus) {
        return;
      }

      setTasksByStatus(prev => {
        const sourceTasks = prev[sourceStatus];
        const targetTasks = prev[targetStatus];
        const activeIndex = sourceTasks.findIndex(task => task.id === activeId);

        if (activeIndex === -1) {
          return prev;
        }

        const overIndexFromSortable = over.data?.current?.sortable?.index;
        const overIndexInTarget = targetTasks.findIndex(task => task.id === overId);
        const insertIndex =
          overIndexFromSortable ?? (overIndexInTarget >= 0 ? overIndexInTarget : targetTasks.length);

        const updatedSource = [...sourceTasks];
        const [movedTask] = updatedSource.splice(activeIndex, 1);
        if (!movedTask) {
          return prev;
        }

        const updatedTarget = [...targetTasks];
        const clampedIndex = Math.min(insertIndex, updatedTarget.length);

        updatedTarget.splice(clampedIndex, 0, { ...movedTask, status: targetStatus });

        return {
          ...prev,
          [sourceStatus]: updatedSource,
          [targetStatus]: updatedTarget,
        };
      });
    },
    [findContainer]
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const sourceStatus = findContainer(activeId);
      const targetStatus = findContainer(overId);

      if (!sourceStatus || !targetStatus) {
        return;
      }

      if (sourceStatus === targetStatus) {
        const items = tasksByStatus[sourceStatus];
        const activeIndex = items.findIndex(task => task.id === activeId);
        const overIndexFromSortable = over.data?.current?.sortable?.index;
        const overIndex = overIndexFromSortable ?? items.findIndex(task => task.id === overId);
        const destinationIndex =
          overIndex >= 0 ? overIndex : items.length - 1;

        if (activeIndex !== -1 && destinationIndex !== -1 && activeIndex !== destinationIndex) {
          const reordered = arrayMove(items, activeIndex, destinationIndex);

          setTasksByStatus(prev => ({
            ...prev,
            [sourceStatus]: reordered,
          }));

          const projectId = reordered[0]?.project_id ?? items[activeIndex]?.project_id;
          if (projectId) {
            reorderTasks(projectId, sourceStatus, reordered);
          }
        }

        return;
      }

      const sourceItems = tasksByStatus[sourceStatus];
      const targetItems = tasksByStatus[targetStatus];
      const activeIndex = sourceItems.findIndex(task => task.id === activeId);

      if (activeIndex === -1) return;

      const overIndexFromSortable = over.data?.current?.sortable?.index;
      const overIndex = targetItems.findIndex(task => task.id === overId);
      const insertIndex =
        overIndexFromSortable ?? (overIndex >= 0 ? overIndex : targetItems.length);

      const updatedSource = [...sourceItems];
      const [movedTask] = updatedSource.splice(activeIndex, 1);
      if (!movedTask) return;

      const updatedTask: EnhancedTask = { ...movedTask, status: targetStatus };
      const updatedTarget = [...targetItems];
      const clampedIndex = Math.min(insertIndex, updatedTarget.length);
      updatedTarget.splice(clampedIndex, 0, updatedTask);

      setTasksByStatus(prev => ({
        ...prev,
        [sourceStatus]: updatedSource,
        [targetStatus]: updatedTarget,
      }));

      reorderTasks(movedTask.project_id, sourceStatus, updatedSource);
      reorderTasks(updatedTask.project_id, targetStatus, updatedTarget);

      try {
        await updateTask(updatedTask);
      } catch (error) {
        console.error('Erro ao atualizar tarefa após movimento:', error);
      }
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
            <button onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
              <PlusIcon className="h-5 w-5" />
              <span>Nova Tarefa</span>
            </button>
        </div>
      </div>
      
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map(status => (
            <SortableContext
              key={status}
              items={tasksByStatus[status]?.map(task => task.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                status={status}
                tasks={tasksByStatus[status] ?? []}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onViewTask={handleViewTask}
                canEditTask={canEditTask}
              />
            </SortableContext>
          ))}
        </div>
      </DndContext>

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