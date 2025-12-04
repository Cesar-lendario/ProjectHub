import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

type RechartsModule = typeof import('recharts');

// Ordem invertida dos status para o tooltip (de cima para baixo: Concluído → Em Andamento → A Fazer → Pendente)
const STATUS_ORDER = [
  TaskStatus.Done,
  TaskStatus.InProgress,
  TaskStatus.ToDo,
  TaskStatus.Pending,
];

const STATUS_LABELS: { [key: string]: string } = {
  [TaskStatus.Pending]: 'Pendente',
  [TaskStatus.ToDo]: 'A Fazer',
  [TaskStatus.InProgress]: 'Em Andamento',
  [TaskStatus.Done]: 'Concluído',
};

const STATUS_COLORS: { [key: string]: string } = {
  [TaskStatus.Pending]: '#ef4444',
  [TaskStatus.ToDo]: '#FFD700',
  [TaskStatus.InProgress]: '#38bdf8',
  [TaskStatus.Done]: '#10b981',
};

interface TasksByStatusChartProps {
  onNavigateToTasksWithProject?: (projectId: string) => void;
}

const TasksByStatusChart: React.FC<TasksByStatusChartProps> = ({ onNavigateToTasksWithProject }) => {
  const { projects } = useProjectContext();
  const [recharts, setRecharts] = useState<RechartsModule | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    import('recharts')
      .then((module) => {
        if (isMounted) {
          setRecharts(module);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Falha ao carregar gráficos.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const data = projects.map(project => {
    const statusCounts = {
      name: project.name.split(' ').slice(0, 2).join(' '),
      projectId: project.id, // Adicionar ID do projeto para navegação
      [TaskStatus.Pending]: 0,
      [TaskStatus.ToDo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };
    project.tasks.forEach(task => {
      // Se o status pendente existir, conta; caso contrário, distribui nos demais
      if (task.status in statusCounts) {
        statusCounts[task.status as keyof typeof statusCounts] += 1;
      } else {
        statusCounts[TaskStatus.ToDo] += 1;
      }
    });
    return statusCounts;
  });

  const handleBarClick = (data: any) => {
    if (!onNavigateToTasksWithProject) return;
    
    // O evento onClick do BarChart fornece informações sobre o clique
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0];
      if (payload && payload.payload) {
        const projectId = payload.payload.projectId;
        if (projectId) {
          console.log('[TasksByStatusChart] 🖱️ Clique na coluna do projeto:', payload.payload.name, 'ID:', projectId);
          onNavigateToTasksWithProject(projectId);
          return;
        }
      }
    }
    
    // Fallback: buscar projeto pelo nome do label
    if (data && data.activeLabel) {
      const projectName = data.activeLabel;
      const project = projects.find(p => {
        const shortName = p.name.split(' ').slice(0, 2).join(' ');
        return shortName === projectName || p.name === projectName;
      });
      if (project) {
        console.log('[TasksByStatusChart] 🖱️ Clique na coluna (fallback):', project.name, 'ID:', project.id);
        onNavigateToTasksWithProject(project.id);
      }
    }
  };

  return (
    <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Tarefas por Status</h3>
          {onNavigateToTasksWithProject && (
            <span className="text-xs text-slate-500 dark:text-slate-400">Clique na coluna para ver tarefas</span>
          )}
        </div>
        {!recharts && !error && (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Carregando gráfico...
          </div>
        )}
        {error && (
          <p className="text-sm text-red-500">Não foi possível carregar o gráfico.</p>
        )}
        {recharts && (
          <recharts.ResponsiveContainer width="100%" height={240}>
            <recharts.BarChart 
              data={data} 
              margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
              onClick={handleBarClick}
            >
                <recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <recharts.XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <recharts.YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <recharts.Tooltip 
                  allowEscapeViewBox={{ x: false, y: false }}
                  offset={20}
                  position={{ x: 'auto', y: 'auto' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    // Ordenar payload pela ordem invertida dos status (de cima para baixo)
                    const orderedPayload = STATUS_ORDER
                      .map(status => payload.find(p => p.dataKey === status))
                      .filter(Boolean);
                    
                    return (
                      <div className="bg-black/50 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-2xl">
                        <p className="font-bold text-white mb-3 text-base">{label}</p>
                        <div className="space-y-2">
                          {orderedPayload.map((entry, index) => {
                            if (!entry) return null;
                            const status = entry.dataKey as string;
                            const value = entry.value as number;
                            // Usar cor definida ou fallback para a cor padrão
                            const color = STATUS_COLORS[status] || entry.color || '#e2e8f0';
                            
                            return (
                              <div key={index} className="flex items-center gap-3 text-sm">
                                <div 
                                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-white/95 flex-1">{STATUS_LABELS[status] || status}</span>
                                <span className="font-bold text-white text-base">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'transparent' }}
                />
                {/* Legenda removida - informação já está visível no tooltip ao passar o mouse */}
                {/* 
                  Ordem racional das barras empilhadas (de baixo para cima):
                  1. Pendente (vermelho) - Base
                  2. A Fazer (dourado) - Em cima de Pendente
                  3. Em Andamento (azul) - Em cima de A Fazer
                  4. Concluído (verde) - Topo
                  
                  Cores: Pendente = #ef4444, A Fazer = #FFD700, Em Andamento = #38bdf8, Concluído = #10b981
                */}
                <recharts.Bar 
                  dataKey={TaskStatus.Pending} 
                  stackId="a" 
                  fill="#ef4444" 
                  name="Pendente"
                  onClick={handleBarClick}
                  style={{ cursor: onNavigateToTasksWithProject ? 'pointer' : 'default' }}
                />
                <recharts.Bar 
                  dataKey={TaskStatus.ToDo} 
                  stackId="a" 
                  fill="#FFD700" 
                  name="A Fazer"
                  onClick={handleBarClick}
                  style={{ cursor: onNavigateToTasksWithProject ? 'pointer' : 'default' }}
                />
                <recharts.Bar 
                  dataKey={TaskStatus.InProgress} 
                  stackId="a" 
                  fill="#38bdf8" 
                  name="Em Andamento"
                  onClick={handleBarClick}
                  style={{ cursor: onNavigateToTasksWithProject ? 'pointer' : 'default' }}
                />
                <recharts.Bar 
                  dataKey={TaskStatus.Done} 
                  stackId="a" 
                  fill="#10b981" 
                  name="Concluído"
                  onClick={handleBarClick}
                  style={{ cursor: onNavigateToTasksWithProject ? 'pointer' : 'default' }}
                />
            </recharts.BarChart>
          </recharts.ResponsiveContainer>
        )}
    </Card>
  );
};

export default TasksByStatusChart;