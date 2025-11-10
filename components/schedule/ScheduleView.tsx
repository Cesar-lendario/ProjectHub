import React, { useMemo } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';

// Helper functions for date manipulation
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDaysDifference = (startDate: Date, endDate: Date): number => {
  // Reset time to midnight for accurate day difference calculation
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};


const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

interface GanttTask extends Task {
  startDate: Date;
  endDate: Date;
}

const getTaskColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Done:
      return 'bg-green-500';
    case TaskStatus.InProgress:
      return 'bg-yellow-500';
    case TaskStatus.ToDo:
      return 'bg-blue-500';
    case TaskStatus.Pending:
       return 'bg-purple-500';
    default:
      return 'bg-slate-400';
  }
};


const ScheduleView: React.FC = () => {
  const { projects } = useProjectContext();
  
  // Gets the start of the week (Sunday) for a given date
  const getStartOfWeek = (date: Date): Date => {
    const dt = new Date(date);
    dt.setHours(0, 0, 0, 0);
    const day = dt.getDay();
    const diff = dt.getDate() - day;
    return new Date(dt.setDate(diff));
  };

  // Gets the end of the week (Saturday) for a given date
  const getEndOfWeek = (date: Date): Date => {
    const dt = new Date(date);
    dt.setHours(23, 59, 59, 999);
    const day = dt.getDay();
    const diff = dt.getDate() - day + 6;
    return new Date(dt.setDate(diff));
  };


  const { ganttTasksByProject, timelineStart, weeklyHeaders } = useMemo(() => {
    if (projects.length === 0 || projects.flatMap(p => p.tasks).length === 0) {
      return { 
        ganttTasksByProject: new Map(), 
        timelineStart: new Date(),
        weeklyHeaders: [] 
      };
    }
    
    let earliestStartOverall: Date | null = null;
    let latestEndOverall: Date | null = null;
    const ganttTasksByProject = new Map<string, { name: string, tasks: GanttTask[] }>();

    projects.forEach(project => {
        if(project.tasks.length === 0) return;

        const processedTasks: GanttTask[] = project.tasks.map(task => {
            // Parse date string as local time to avoid timezone issues.
            // The due date is inclusive, so we consider the end of that day.
            const endDate = new Date(`${task.dueDate}T23:59:59`);
            
            // Duration includes the end day. A 1-day task starts and ends on the same day.
            const startDate = addDays(new Date(`${task.dueDate}T00:00:00`), -task.duration + 1);
            
            if (!earliestStartOverall || startDate < earliestStartOverall) earliestStartOverall = startDate;
            if (!latestEndOverall || endDate > latestEndOverall) latestEndOverall = endDate;
            
            return { ...task, startDate, endDate };
        });
       
        ganttTasksByProject.set(project.id, { name: project.name, tasks: processedTasks });
    });
    
    if (!earliestStartOverall || !latestEndOverall) {
        return { ganttTasksByProject: new Map(), timelineStart: new Date(), weeklyHeaders: [] };
    }

    const timelineStart = getStartOfWeek(earliestStartOverall);
    const timelineEnd = getEndOfWeek(latestEndOverall);

    const headers = [];
    let currentDate = new Date(timelineStart);
    while (currentDate <= timelineEnd) {
      headers.push({
        startDate: new Date(currentDate),
        label: `Semana de ${formatDate(currentDate)}`
      });
      currentDate = addDays(currentDate, 7);
    }

    return { ganttTasksByProject, timelineStart, weeklyHeaders: headers };
  }, [projects]);
  
  const WEEK_CELL_WIDTH = 120; // in pixels

  return (
    <Card>
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Cronograma do Projeto (Gantt)</h2>
            <p className="mt-1 text-slate-600">Visualize as tarefas e seus prazos em uma linha do tempo semanal.</p>
        </div>
        <div className="overflow-x-auto relative border border-slate-200 rounded-lg">
            <div style={{ minWidth: `${weeklyHeaders.length * WEEK_CELL_WIDTH}px` }}>
                {/* Timeline Header */}
                <div className="flex bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    {weeklyHeaders.map((week, index) => (
                        <div 
                            key={index} 
                            style={{ width: `${WEEK_CELL_WIDTH}px` }} 
                            className="flex-shrink-0 text-center border-r border-slate-200 py-3"
                        >
                           <div className="text-sm font-medium text-slate-700">{week.label}</div>
                        </div>
                    ))}
                </div>
                 {/* Gantt Body */}
                 <div className="relative">
                    {Array.from(ganttTasksByProject.entries()).map(([projectId, projectData]) => (
                        <div key={projectId} className="border-t border-slate-200">
                            <h3 className="text-md font-bold text-indigo-700 p-2 bg-indigo-50 sticky left-0 w-full z-10">{projectData.name}</h3>
                            <div className="relative">
                              {projectData.tasks.map((task) => {
                                  const offsetDays = getDaysDifference(timelineStart, task.startDate);
                                  const left = (offsetDays / 7) * WEEK_CELL_WIDTH;

                                  const widthDays = task.duration > 0 ? task.duration : 1;
                                  const width = (widthDays / 7) * WEEK_CELL_WIDTH - 4; // -4 for padding
                                  
                                  return (
                                      <div key={task.id} className="relative h-10 my-1 flex items-center group px-2">
                                          <div 
                                              className={`absolute h-8 rounded ${getTaskColor(task.status)} transition-all duration-300 hover:opacity-80 shadow-sm`}
                                              style={{
                                                  left: `${left}px`,
                                                  width: `${width}px`,
                                              }}
                                          >
                                              <span className="text-xs font-medium text-white px-2 py-1 absolute inset-0 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                                                  {task.name}
                                              </span>
                                              {/* Tooltip */}
                                              <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-xs rounded py-1 px-2 z-20 shadow-lg">
                                                  <p><strong>Tarefa:</strong> {task.name}</p>
                                                  <p><strong>Início:</strong> {task.startDate.toLocaleDateString('pt-BR')}</p>
                                                  <p><strong>Fim:</strong> {task.endDate.toLocaleDateString('pt-BR')}</p>
                                                  <p><strong>Status:</strong> {task.status}</p>
                                                  <p><strong>Responsável:</strong> {task.assignee?.name || 'N/A'}</p>
                                              </div>
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
         {projects.flatMap(p => p.tasks).length === 0 && <p className="text-center py-8 text-slate-500">Nenhuma tarefa para exibir no cronograma. Adicione tarefas aos seus projetos.</p>}
    </Card>
  );
};

export default ScheduleView;