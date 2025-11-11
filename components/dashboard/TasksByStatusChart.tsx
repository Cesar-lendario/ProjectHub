import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

type RechartsModule = typeof import('recharts');

const TasksByStatusChart: React.FC = () => {
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
      [TaskStatus.ToDo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };
    project.tasks.forEach(task => {
      statusCounts[task.status]++;
    });
    return statusCounts;
  });

  return (
    <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tarefas por Status</h3>
        {!recharts && !error && (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            Carregando gráfico...
          </div>
        )}
        {error && (
          <p className="text-sm text-red-500">Não foi possível carregar o gráfico.</p>
        )}
        {recharts && (
          <recharts.ResponsiveContainer width="100%" height={300}>
            <recharts.BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <recharts.XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <recharts.YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <recharts.Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <recharts.Legend wrapperStyle={{ fontSize: '14px' }} />
                <recharts.Bar dataKey={TaskStatus.ToDo} stackId="a" fill="#38bdf8" name="A Fazer" />
                <recharts.Bar dataKey={TaskStatus.InProgress} stackId="a" fill="#f59e0b" name="Em Andamento" />
                <recharts.Bar dataKey={TaskStatus.Done} stackId="a" fill="#10b981" name="Concluído" />
            </recharts.BarChart>
          </recharts.ResponsiveContainer>
        )}
    </Card>
  );
};

export default TasksByStatusChart;