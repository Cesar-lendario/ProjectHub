import React, { useMemo, useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus, Project } from '../../types';

// Cores para os status das tarefas no cronograma
// Concluído = verde, Pendente = vermelho, A Fazer = roxo, Em andamento = azul
const STATUS_COLORS: Record<TaskStatus | 'default', string> = {
  [TaskStatus.Done]: 'bg-green-500',
  [TaskStatus.Pending]: 'bg-red-500',
  [TaskStatus.ToDo]: 'bg-purple-500',
  [TaskStatus.InProgress]: 'bg-blue-500',
  default: 'bg-gray-300',
};

interface TimelineCell {
  day: number;
  date: Date;
  status?: TaskStatus;
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
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Sincronizar o projeto selecionado com o projectId vindo de fora (ScheduleView)
  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  // Gerar dias do mês selecionado
  const days = useMemo(() => {
    const result: { day: number; date: Date }[] = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        day,
        date: new Date(selectedYear, selectedMonth, day)
      });
    }
    
    return result;
  }, [selectedYear, selectedMonth]);

  // Formatar nome do mês
  const formatMonthYear = (): string => {
    return new Date(selectedYear, selectedMonth, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Obter nome do dia da semana (abreviado)
  const getDayOfWeek = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { weekday: 'narrow' });
  };

  // Obter o projeto selecionado
  const selectedProjectData = useMemo(() => {
    if (!selectedProject) {
      return projects.length > 0 ? projects[0] : null;
    }
    return projects.find(p => p.id === selectedProject) || null;
  }, [projects, selectedProject]);

  // Dados do cronograma
  const timelineData = useMemo(() => {
    if (!selectedProjectData || !selectedProjectData.tasks || selectedProjectData.tasks.length === 0) {
      return [];
    }

    // Definir tarefas prioritárias que devem aparecer no topo da tabela
    const PRIORITY_TASKS = [
      'DOCUMENTOS DA EMPRESA',
      'NF/ IDENTIFICAÇÃO',
    ];

    // Criar linhas do cronograma com base nas tarefas reais do projeto,
    // aplicando ordenação para trazer as tarefas prioritárias para o topo
    const orderedTasks = [...selectedProjectData.tasks].sort((a, b) => {
      const aIndex = PRIORITY_TASKS.findIndex(name => a.name.toUpperCase().startsWith(name));
      const bIndex = PRIORITY_TASKS.findIndex(name => b.name.toUpperCase().startsWith(name));

      const aPriority = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bPriority = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

      if (aPriority !== bPriority) return aPriority - bPriority;
      return 0; // mantém ordem relativa original para demais tarefas
    });

    const rows: TimelineRow[] = orderedTasks.map(task => {
      // Calcular data de início e fim da tarefa
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(23, 59, 59, 999);
      
      // Calcular data de início com base na duração
      const taskStartDate = new Date(task.dueDate);
      taskStartDate.setDate(taskStartDate.getDate() - (task.duration - 1));
      taskStartDate.setHours(0, 0, 0, 0);
      
      const cells: TimelineCell[] = days.map((dayData) => {
        const currentDate = new Date(dayData.date);
        currentDate.setHours(12, 0, 0, 0); // meio do dia
        
        // Verificar se o dia atual está dentro do período da tarefa
        if (currentDate >= taskStartDate && currentDate <= taskDueDate) {
          return {
            day: dayData.day,
            date: dayData.date,
            status: task.status,
          };
        }
        
        return {
          day: dayData.day,
          date: dayData.date
        };
      });
      
      return {
        id: task.id,
        name: task.name,
        cells
      };
    });
    
    return rows;
  }, [days, selectedProjectData, selectedYear, selectedMonth]);

  // Semanas do mês para agrupamento visual
  const weekGroups = useMemo(() => {
    const groups: { week: number; days: number[] }[] = [];
    let currentWeek = 1;
    let currentGroup: number[] = [];
    
    days.forEach((day, index) => {
      const dayOfWeek = new Date(selectedYear, selectedMonth, day.day).getDay();
      
      // Se é domingo (0) e não é o primeiro dia, começar nova semana
      if (dayOfWeek === 0 && currentGroup.length > 0) {
        groups.push({ week: currentWeek, days: currentGroup });
        currentWeek++;
        currentGroup = [day.day];
      } else {
        currentGroup.push(day.day);
      }
    });
    
    // Adicionar última semana
    if (currentGroup.length > 0) {
      groups.push({ week: currentWeek, days: currentGroup });
    }
    
    return groups;
  }, [days, selectedYear, selectedMonth]);

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
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i).map(month => (
              <option key={month} value={month} className="bg-white text-slate-800">
                {new Date(2000, month, 1).toLocaleDateString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <select
            className="bg-indigo-600 text-white border border-indigo-400 rounded px-3 py-1 text-sm font-medium"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
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
              <th className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-bold text-slate-900 dark:text-white" rowSpan={2}>
                TAREFAS
              </th>
              <th 
                colSpan={days.length}
                className="bg-yellow-300 dark:bg-yellow-600 border border-slate-300 dark:border-slate-600 text-center py-1 font-bold text-slate-900 dark:text-white capitalize"
              >
                {formatMonthYear()}
              </th>
            </tr>
            <tr>
              {days.map((day, index) => {
                const dayOfWeek = getDayOfWeek(day.date);
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                return (
                  <th 
                    key={`day-${day.day}`}
                    className={`border border-slate-300 dark:border-slate-600 text-center py-1 font-bold w-8 text-xs ${
                      isWeekend 
                        ? 'bg-yellow-200 dark:bg-yellow-700 text-slate-700 dark:text-slate-300' 
                        : 'bg-yellow-300 dark:bg-yellow-600 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div>{day.day}</div>
                    <div className="text-[10px] font-normal">{dayOfWeek}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timelineData.map(row => (
              <tr key={row.id}>
                <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 font-medium text-white bg-slate-700">
                  {row.name}
                </td>
                {row.cells.map((cell, cellIndex) => {
                  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
                  return (
                    <td 
                      key={`cell-${row.id}-${cellIndex}`}
                      className={`border border-slate-300 dark:border-slate-600 p-0 text-center h-8 ${
                        cell.status ? STATUS_COLORS[cell.status] : (isWeekend ? 'bg-slate-100 dark:bg-slate-800' : '')
                      }`}
                      title={cell.status ? `${row.name} - ${cell.date.toLocaleDateString('pt-BR')}` : ''}
                    >
                      <span>&nbsp;</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-slate-300 dark:border-slate-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 border border-slate-300 dark:border-slate-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">A Fazer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border border-slate-300 dark:border-slate-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Em andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border border-slate-300 dark:border-slate-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Concluído</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Final de semana</span>
        </div>
      </div>
    </Card>
  );
};

export default ImplementationTimeline;
