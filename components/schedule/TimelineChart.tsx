import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskStatus } from '../../types';

// Definição de tipos para o cronograma
interface TimelineTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  color: string;
}

interface TimelineGroup {
  id: string;
  name: string;
  tasks: TimelineTask[];
}

// Cores para os status das tarefas
// Concluído = verde, Pendente = vermelho, A Fazer = roxo, Em andamento = azul
const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: '#ef4444',    // Vermelho
  [TaskStatus.ToDo]: '#a855f7',       // Roxo
  [TaskStatus.InProgress]: '#3b82f6', // Azul
  [TaskStatus.Done]: '#10b981',       // Verde
};

// Função para gerar meses entre duas datas
const getMonthsBetween = (startDate: Date, endDate: Date): Date[] => {
  const months: Date[] = [];
  let currentDate = new Date(startDate);
  
  // Definir para o primeiro dia do mês
  currentDate.setDate(1);
  
  // Enquanto a data atual for menor ou igual à data final
  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
};

// Função para formatar o nome do mês
const formatMonth = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { month: 'short' });
};

// Função para formatar o ano
const formatYear = (date: Date): string => {
  return date.getFullYear().toString();
};

const TimelineChart: React.FC = () => {
  const { projects } = useProjectContext();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Calcular o período do cronograma e os dados das tarefas
  const { timelineGroups, startDate, endDate, months } = useMemo(() => {
    // Se não houver projetos, retornar valores padrão
    if (projects.length === 0) {
      const currentDate = new Date();
      const start = new Date(currentDate.getFullYear(), 0, 1); // 1º de janeiro do ano atual
      const end = new Date(currentDate.getFullYear(), 11, 31); // 31 de dezembro do ano atual
      
      return {
        timelineGroups: [],
        startDate: start,
        endDate: end,
        months: getMonthsBetween(start, end)
      };
    }
    
    // Filtrar projetos e tarefas pelo ano selecionado
    const filteredProjects = projects.filter(project => {
      const projectStartYear = new Date(project.startDate).getFullYear();
      const projectEndYear = new Date(project.endDate).getFullYear();
      return projectStartYear <= selectedYear && projectEndYear >= selectedYear;
    });
    
    // Definir o período do cronograma (ano completo)
    const start = new Date(selectedYear, 0, 1); // 1º de janeiro
    const end = new Date(selectedYear, 11, 31); // 31 de dezembro
    
    // Criar grupos de tarefas para o cronograma
    const groups: TimelineGroup[] = filteredProjects.map(project => {
      const tasks: TimelineTask[] = project.tasks
        .filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate.getFullYear() === selectedYear;
        })
        .map(task => {
          // Calcular data de início com base na duração
          const endDate = new Date(task.dueDate);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - (task.duration - 1));
          
          return {
            id: task.id,
            name: task.name,
            startDate,
            endDate,
            status: task.status,
            color: STATUS_COLORS[task.status]
          };
        });
      
      return {
        id: project.id,
        name: project.name,
        tasks
      };
    });
    
    return {
      timelineGroups: groups,
      startDate: start,
      endDate: end,
      months: getMonthsBetween(start, end)
    };
  }, [projects, selectedYear]);
  
  // Lista de anos disponíveis para seleção
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    
    // Adicionar anos dos projetos
    projects.forEach(project => {
      const startYear = new Date(project.startDate).getFullYear();
      const endYear = new Date(project.endDate).getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        years.add(year);
      }
    });
    
    // Se não houver anos, adicionar o ano atual
    if (years.size === 0) {
      years.add(currentYear);
    }
    
    return Array.from(years).sort();
  }, [projects]);
  
  // Calcular o número de dias em cada mês
  const daysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Calcular a posição e largura de uma tarefa no cronograma
  const calculateTaskPosition = (task: TimelineTask): { left: string, width: string } => {
    // Garantir que as datas estejam dentro do período do cronograma
    const taskStart = new Date(Math.max(task.startDate.getTime(), startDate.getTime()));
    const taskEnd = new Date(Math.min(task.endDate.getTime(), endDate.getTime()));
    
    // Calcular o total de dias no ano
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calcular a posição da tarefa
    const daysSinceStart = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    // Converter para porcentagem
    const left = (daysSinceStart / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`
    };
  };
  
  // Renderizar o componente
  return (
    <Card className="bg-white dark:bg-slate-800 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
          CRONOGRAMA DE IMPLANTAÇÃO
        </h3>
        <select
          className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-yellow-300 dark:bg-yellow-600">
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left w-48">
                TAREFAS
              </th>
              <th className="border border-slate-300 dark:border-slate-600 px-0 py-2" colSpan={12}>
                <div className="flex">
                  {months.map((month, index) => (
                    <div 
                      key={index}
                      className="flex-1 text-center font-semibold"
                    >
                      {formatMonth(month)}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
            <tr className="bg-yellow-300 dark:bg-yellow-600">
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">
                PRAZOS
              </th>
              {months.map((month, monthIndex) => {
                const daysCount = daysInMonth(selectedYear, month.getMonth());
                return Array.from({ length: daysCount }).map((_, dayIndex) => (
                  <th 
                    key={`${monthIndex}-${dayIndex}`}
                    className="border border-slate-300 dark:border-slate-600 w-6 p-0 text-center text-xs"
                  >
                    {/* Célula vazia para representar cada dia */}
                  </th>
                ));
              })}
            </tr>
          </thead>
          <tbody>
            {timelineGroups.map(group => (
              <React.Fragment key={group.id}>
                {group.tasks.map(task => {
                  const position = calculateTaskPosition(task);
                  return (
                    <tr key={task.id} className="hover:bg-slate-100 dark:hover:bg-slate-700/30">
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm">
                        {task.name}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 p-0 relative" colSpan={365}>
                        <div 
                          className="absolute top-0 bottom-0 h-full"
                          style={{
                            left: position.left,
                            width: position.width,
                            backgroundColor: task.color,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TimelineChart;
