import React, { useMemo, useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';
import ImplementationTimeline from './ImplementationTimeline';

// Helper functions for date manipulation
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const formatDayLabel = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const getMonthLabel = (date: Date): string =>
  date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const startOfDay = (date: Date): Date => {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const endOfDay = (date: Date): Date => {
  const dt = new Date(date);
  dt.setHours(23, 59, 59, 999);
  return dt;
};

const startOfWeek = (date: Date): Date => {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay();
  const diff = dt.getDate() - day;
  return new Date(dt.setDate(diff));
};

const endOfWeek = (date: Date): Date => {
  const dt = new Date(date);
  dt.setHours(23, 59, 59, 999);
  const day = dt.getDay();
  const diff = dt.getDate() - day + 6;
  return new Date(dt.setDate(diff));
};

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

interface GanttTask extends Task {
  startDate: Date;
  endDate: Date;
}

const getTaskColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Pending:
      return 'bg-purple-400';
    case TaskStatus.ToDo:
      return 'bg-blue-400';
    case TaskStatus.InProgress:
      return 'bg-amber-400';
    case TaskStatus.Done:
      return 'bg-emerald-400';
    default:
      return 'bg-slate-400';
  }
};

type ViewMode = 'implementation';

const VIEW_CONFIG: Record<ViewMode, { dayWidth: number; label: string }> = {
  implementation: { dayWidth: 0, label: 'Cronograma' },
};

const ScheduleView: React.FC = () => {
  const { projects } = useProjectContext();
  const [viewMode, setViewMode] = useState<ViewMode>('implementation');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Selecionar sempre um projeto válido por padrão
  useEffect(() => {
    if (projects.length === 0) {
      if (selectedProjectId !== '') {
        setSelectedProjectId('');
      }
      return;
    }

    const exists = projects.some(p => p.id === selectedProjectId);
    if (!exists) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Função para filtrar projetos com base no projeto selecionado
  const filteredProjects = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }
    return projects.filter(project => project.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const {
    ganttTasksByProject,
    timelineStart,
    timelineEnd,
    headers,
    dayWidth,
    totalDays,
  } = useMemo(() => {
    const dayWidth = VIEW_CONFIG[viewMode].dayWidth;

    if (filteredProjects.length === 0 || filteredProjects.flatMap((p) => p.tasks).length === 0) {
      return {
        ganttTasksByProject: new Map<string, { name: string; tasks: GanttTask[] }>(),
        timelineStart: new Date(),
        timelineEnd: new Date(),
        headers: [] as { startDate: Date; endDate: Date; label: string }[],
        dayWidth,
        totalDays: 0,
      };
    }

    let earliestStartOverall: Date | null = null;
    let latestEndOverall: Date | null = null;

    const ganttTasksByProject = new Map<string, { name: string; tasks: GanttTask[] }>();

    filteredProjects.forEach((project) => {
      if (project.tasks.length === 0) return;

      const processedTasks: GanttTask[] = project.tasks.map((task) => {
        const endDate = new Date(`${task.dueDate}T23:59:59`);
        const startDate = addDays(new Date(`${task.dueDate}T00:00:00`), -task.duration + 1);

        if (!earliestStartOverall || startDate < earliestStartOverall) earliestStartOverall = startDate;
        if (!latestEndOverall || endDate > latestEndOverall) latestEndOverall = endDate;

        return { ...task, startDate, endDate };
      });

      ganttTasksByProject.set(project.id, { name: project.name, tasks: processedTasks });
    });

    if (!earliestStartOverall || !latestEndOverall) {
      return {
        ganttTasksByProject: new Map<string, { name: string; tasks: GanttTask[] }>(),
        timelineStart: new Date(),
        timelineEnd: new Date(),
        headers: [] as { startDate: Date; endDate: Date; label: string }[],
        dayWidth,
        totalDays: 0,
      };
    }

    const timelineStart =
      viewMode === 'daily'
        ? startOfDay(earliestStartOverall)
        : viewMode === 'weekly'
        ? startOfWeek(earliestStartOverall)
        : startOfMonth(earliestStartOverall);

    const timelineEnd =
      viewMode === 'daily'
        ? endOfDay(latestEndOverall)
        : viewMode === 'weekly'
        ? endOfWeek(latestEndOverall)
        : endOfMonth(latestEndOverall);

    const headers: { startDate: Date; endDate: Date; label: string }[] = [];

    if (viewMode === 'daily') {
      let current = new Date(timelineStart);
      while (current <= timelineEnd) {
        const headerStart = startOfDay(current);
        const headerEnd = endOfDay(current);
        headers.push({
          startDate: headerStart,
          endDate: headerEnd > timelineEnd ? timelineEnd : headerEnd,
          label: formatDayLabel(headerStart),
        });
        current = addDays(current, 1);
      }
    } else if (viewMode === 'weekly') {
      let current = new Date(timelineStart);
      while (current <= timelineEnd) {
        const headerStart = startOfWeek(current);
        const headerEnd = endOfWeek(current);
        headers.push({
          startDate: headerStart,
          endDate: headerEnd > timelineEnd ? timelineEnd : headerEnd,
          label: `Semana de ${formatDate(headerStart)}`,
        });
        current = addDays(headerStart, 7);
      }
    } else {
      let current = startOfMonth(timelineStart);
      while (current <= timelineEnd) {
        const headerStart = startOfMonth(current);
        const headerEnd = endOfMonth(current);
        headers.push({
          startDate: headerStart,
          endDate: headerEnd > timelineEnd ? timelineEnd : headerEnd,
          label: getMonthLabel(headerStart),
        });
        current = startOfMonth(addMonths(headerStart, 1));
      }
    }

    const totalDays = getDaysDifference(timelineStart, timelineEnd) + 1;

    return { ganttTasksByProject, timelineStart, timelineEnd, headers, dayWidth, totalDays };
  }, [filteredProjects, viewMode]);

  const timelineWidth = Math.max(totalDays * dayWidth, headers.length * dayWidth);
  const hasTasks = Array.from(ganttTasksByProject.values()).some((group: { name: string; tasks: GanttTask[] }) => group.tasks.length > 0);

  // Verificar se há projetos
  const noProjects = projects.length === 0;

  return (
    <Card className="bg-slate-900/70 border border-slate-700/40 shadow-lg shadow-indigo-900/20 backdrop-blur-sm min-h-[70vh] flex flex-col">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Cronograma do Projeto</h2>
          <p className="mt-1 text-slate-400 text-sm">
            Visualize as tarefas e seus prazos em diferentes escalas de tempo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 1 && (
            <select
              className="bg-slate-800/60 text-slate-300 border border-slate-700/50 rounded px-3 py-1.5 text-sm"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {noProjects ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p>Nenhum projeto encontrado. Crie um projeto para visualizar o cronograma.</p>
        </div>
      ) : viewMode === 'implementation' ? (
        <ImplementationTimeline projectId={selectedProjectId} />
      ) : !hasTasks || headers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p>Nenhuma tarefa para exibir no cronograma. Adicione tarefas aos seus projetos.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto relative border border-slate-800/40 rounded-xl bg-slate-900/40">
          <div style={{ minWidth: `${timelineWidth}px` }}>
            <div className="flex bg-slate-900/60 sticky top-0 z-10 border-b border-slate-800/60">
              {headers.map((header, index) => {
                const spanDays = getDaysDifference(header.startDate, header.endDate) + 1;
                return (
                  <div
                    key={`${header.label}-${index}`}
                    style={{ width: `${spanDays * dayWidth}px` }}
                    className="flex-shrink-0 text-center border-r border-slate-800/60 py-3"
                  >
                    <div className="text-sm font-semibold text-slate-200 capitalize">
                      {header.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              {Array.from(ganttTasksByProject.entries()).map(([projectId, projectData]) => (
                <div key={projectId} className="border-t border-slate-800/50">
                  <div className="px-4 py-3 text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                    {projectData.name}
                  </div>
                  <div className="relative h-20">
                    {projectData.tasks.map((task) => {
                      const clampedStart =
                        task.startDate < timelineStart ? timelineStart : task.startDate;
                      const clampedEnd =
                        task.endDate > timelineEnd ? timelineEnd : task.endDate;

                      const offsetDays = Math.max(
                        0,
                        getDaysDifference(timelineStart, clampedStart)
                      );
                      const taskDurationDays = Math.max(
                        1,
                        getDaysDifference(clampedStart, clampedEnd) + 1
                      );

                      const taskWidth = taskDurationDays * dayWidth;
                      const leftOffset = offsetDays * dayWidth;

                      return (
                        <div key={task.id} className="relative h-10 my-1 flex items-center px-2">
                          <div
                            className={`absolute top-1 h-8 rounded-lg ${getTaskColor(
                              task.status
                            )} bg-opacity-90 flex items-center px-3 text-xs font-semibold text-slate-900 shadow-md transition-all duration-300 hover:shadow-lg`}
                            style={{
                              width: `${taskWidth}px`,
                              left: `${leftOffset}px`,
                            }}
                          >
                            <span className="truncate">{task.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScheduleView;