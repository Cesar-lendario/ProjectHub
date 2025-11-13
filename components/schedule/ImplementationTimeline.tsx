import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus, Project } from '../../types';

// Cores para os status das tarefas
const STATUS_COLORS: Record<string, string> = {
  'planejamento': 'bg-green-500',
  'execucao': 'bg-red-500',
  'concluido': 'bg-blue-500 text-white',
  'pendente': 'bg-yellow-400',
  'default': 'bg-gray-300'
};

interface TimelineCell {
  year: number;
  month: number;
  status?: string;
}

interface TimelineRow {
  id: string;
  name: string;
  cells: TimelineCell[];
}

interface ImplementationTimelineProps {
  projectId?: string;
}

const ImplementationTimeline: React.FC<ImplementationTimelineProps> = ({ projectId }) => {
  const { projects } = useProjectContext();
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 1);

  // Gerar meses para o período selecionado
  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const startMonth = year === startYear ? 0 : 0;
      const endMonth = year === endYear ? 11 : 11;
      
      for (let month = startMonth; month <= endMonth; month++) {
        result.push({ year, month });
      }
    }
    
    return result;
  }, [startYear, endYear]);

  // Formatar nome do mês
  const formatMonth = (month: number): string => {
    return new Date(2000, month, 1).toLocaleDateString('pt-BR', { month: 'short' });
  };

  // Obter o projeto selecionado
  const selectedProjectData = useMemo(() => {
    if (!selectedProject) {
      return projects.length > 0 ? projects[0] : null;
    }
    return projects.find(p => p.id === selectedProject) || null;
  }, [projects, selectedProject]);

  // Mapear status das tarefas para cores
  const mapTaskStatusToColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.Pending:
        return 'planejamento';
      case TaskStatus.ToDo:
        return 'planejamento';
      case TaskStatus.InProgress:
        return 'execucao';
      case TaskStatus.Done:
        return 'concluido';
      default:
        return 'default';
    }
  };

  // Dados do cronograma
  const timelineData = useMemo(() => {
    if (!selectedProjectData || !selectedProjectData.tasks || selectedProjectData.tasks.length === 0) {
      return [];
    }

    // Calcular o mês de início do projeto
    const projectStartDate = new Date(selectedProjectData.startDate);
    const projectStartMonth = projectStartDate.getMonth();
    const projectStartYear = projectStartDate.getFullYear();
    
    // Criar linhas do cronograma com base nas tarefas reais do projeto
    const rows: TimelineRow[] = selectedProjectData.tasks.map(task => {
      // Calcular data de início e fim da tarefa
      const taskDueDate = new Date(task.dueDate);
      const taskEndMonth = taskDueDate.getMonth();
      const taskEndYear = taskDueDate.getFullYear();
      
      // Calcular data de início com base na duração
      const taskStartDate = new Date(taskDueDate);
      taskStartDate.setDate(taskStartDate.getDate() - (task.duration - 1));
      const taskStartMonth = taskStartDate.getMonth();
      const taskStartYear = taskStartDate.getFullYear();
      
      const cells: TimelineCell[] = months.map((monthData, index) => {
        const currentDate = new Date(monthData.year, monthData.month, 15); // meio do mês
        const taskStart = new Date(taskStartYear, taskStartMonth, 1);
        const taskEnd = new Date(taskEndYear, taskEndMonth, 28); // final aproximado do mês
        
        if (currentDate >= taskStart && currentDate <= taskEnd) {
          return {
            year: monthData.year,
            month: monthData.month,
            status: mapTaskStatusToColor(task.status)
          };
        }
        
        return {
          year: monthData.year,
          month: monthData.month
        };
      });
      
      return {
        id: task.id,
        name: task.name,
        cells
      };
    });
    
    return rows;
  }, [months, selectedProjectData, startYear]);

  // Agrupar meses por ano para o cabeçalho
  const yearGroups = useMemo(() => {
    const groups: { year: number; count: number }[] = [];
    
    months.forEach(month => {
      const existingGroup = groups.find(group => group.year === month.year);
      if (existingGroup) {
        existingGroup.count++;
      } else {
        groups.push({ year: month.year, count: 1 });
      }
    });
    
    return groups;
  }, [months]);

  return (
    <Card className="overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div></div>
        
        <div className="flex flex-wrap gap-2">
          {projects.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum projeto disponível
            </div>
          ) : projects.length > 1 ? (
            <select
              className="bg-indigo-600 text-white border border-indigo-400 rounded px-3 py-1 text-sm font-medium"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id} className="bg-white text-slate-800">{project.name}</option>
              ))}
            </select>
          ) : null}
          
          <select
            className="bg-indigo-600 text-white border border-indigo-400 rounded px-3 py-1 text-sm font-medium"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year} className="bg-white text-slate-800">{year}</option>
            ))}
          </select>
          
          <select
            className="bg-indigo-600 text-white border border-indigo-400 rounded px-3 py-1 text-sm font-medium"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
              <option key={year} value={year} className="bg-white text-slate-800">{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Exibir o nome do projeto selecionado de forma discreta */}
      {selectedProjectData && (
        <div className="mb-2 text-right">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Projeto: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedProjectData.name}</span>
          </span>
        </div>
      )}
      
      <div className="overflow-x-auto">
        {timelineData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 dark:text-slate-400 h-40">
            <p>Nenhuma tarefa para exibir no cronograma. Adicione tarefas ao projeto selecionado.</p>
          </div>
        ) : (
          <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-bold text-slate-900 dark:text-white">
                TAREFAS
              </th>
              {yearGroups.map((group, index) => (
                <th 
                  key={`year-${group.year}`}
                  colSpan={group.count}
                  className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 text-center py-1 font-bold text-slate-900 dark:text-white"
                >
                  {group.year}
                </th>
              ))}
            </tr>
            <tr>
              <th className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-bold text-slate-900 dark:text-white">
                PRAZOS
              </th>
              {months.map((month, index) => (
                <th 
                  key={`month-${month.year}-${month.month}`}
                  className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 text-center py-1 font-bold w-12 text-slate-900 dark:text-white"
                >
                  {formatMonth(month.month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timelineData.map(row => (
              <tr key={row.id}>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-medium text-white bg-slate-700">
                  {row.name}
                </td>
                {row.cells.map((cell, cellIndex) => (
                  <td 
                    key={`cell-${row.id}-${cellIndex}`}
                    className={`border border-slate-300 dark:border-slate-600 p-0 text-center ${
                      cell.status ? STATUS_COLORS[cell.status] : ''
                    }`}
                  >
                    {cell.status === 'concluido' ? (
                      <span className="text-white">&nbsp;</span>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span className="text-sm">Planejamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span className="text-sm">Execução</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs">C</span>
          </div>
          <span className="text-sm">Concluído</span>
        </div>
      </div>
    </Card>
  );
};

export default ImplementationTimeline;
