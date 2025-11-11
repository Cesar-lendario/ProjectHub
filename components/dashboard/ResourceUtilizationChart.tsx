import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';
import { USERS } from '../../constants';

const COLORS = ['#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#2ecc71'];
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

  const allTasks = projects.flatMap(p => p.tasks);
  const userTaskCounts: { [key: string]: number } = {};
  
  USERS.forEach(user => userTaskCounts[user.name] = 0);
  
  allTasks.forEach(task => {
    if (task.assignee) {
        if(userTaskCounts[task.assignee.name]) {
            userTaskCounts[task.assignee.name]++;
        } else {
            userTaskCounts[task.assignee.name] = 1;
        }
    }
  });

  const data = Object.entries(userTaskCounts).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Utilização de Recursos</h3>
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
          <recharts.PieChart>
            <recharts.Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <recharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </recharts.Pie>
            <recharts.Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
            <recharts.Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          </recharts.PieChart>
        </recharts.ResponsiveContainer>
      )}
    </Card>
  );
};

export default ResourceUtilizationChart;