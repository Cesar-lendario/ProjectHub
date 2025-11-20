import React, { useEffect, useMemo, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';

const COLORS = ['#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#2ecc71'];
const UNASSIGNED_LABEL = 'Não atribuído';
type RechartsModule = typeof import('recharts');

const ResourceUtilizationChart: React.FC = () => {
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

  const { data, totalTasks } = useMemo(() => {
    const taskCounts = new Map<string, number>();

    // Inicializa todos os membros da equipe que fazem parte dos projetos
    projects.forEach(project => {
      project.team.forEach(member => {
        const key = member.user.name || member.user.id;
        if (!taskCounts.has(key)) {
          taskCounts.set(key, 0);
        }
      });
    });

    // Computa tarefas atribuídas
    let accumulatedTasks = 0;
    projects.forEach(project => {
      project.tasks.forEach(task => {
        const assigneeName = task.assignee?.name;
        if (assigneeName) {
          taskCounts.set(assigneeName, (taskCounts.get(assigneeName) ?? 0) + 1);
        } else {
          taskCounts.set(UNASSIGNED_LABEL, (taskCounts.get(UNASSIGNED_LABEL) ?? 0) + 1);
        }
        accumulatedTasks += 1;
      });
    });

    // Garante que a label de não atribuídos exista pelo menos com zero
    if (!taskCounts.has(UNASSIGNED_LABEL)) {
      taskCounts.set(UNASSIGNED_LABEL, 0);
    }

    const chartData = Array.from(taskCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      data: chartData,
      totalTasks: accumulatedTasks,
    };
  }, [projects]);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50 mb-3">Utilização de Recursos</h3>
      {!recharts && !error && (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          Carregando gráfico...
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">Não foi possível carregar o gráfico.</p>
      )}
      {recharts && totalTasks === 0 && (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-300">
          Ainda não existem tarefas registradas para calcular a utilização de recursos.
        </div>
      )}
      {recharts && totalTasks > 0 && (
        <recharts.ResponsiveContainer width="100%" height={240}>
          <recharts.PieChart>
            <recharts.Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <recharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </recharts.Pie>
            <recharts.Tooltip
              formatter={(value: number) => [`${value} tarefa(s)`, 'Tarefas']}
              labelFormatter={(label: string) => `Responsável: ${label}`}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0' }}
            />
            <recharts.Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px', color: '#e2e8f0' }} />
          </recharts.PieChart>
        </recharts.ResponsiveContainer>
      )}
    </Card>
  );
};

export default ResourceUtilizationChart;