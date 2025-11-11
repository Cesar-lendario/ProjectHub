// Fix: Implemented the BudgetChart component, which was missing. This file was empty, causing an import error in ReportsView.tsx.
import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';

type RechartsModule = typeof import('recharts');

const BudgetChart: React.FC = () => {
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

  const data = projects.map(project => ({
    name: project.name.split(' ').slice(0, 2).join(' '),
    Orçamento: project.budget,
    'Custo Real': project.actualCost,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50 mb-4">Orçamento vs. Custo Real</h3>
        {!recharts && !error && (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
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
                <recharts.YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} 
                />
                <recharts.Tooltip formatter={(value: number | string) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <recharts.Legend wrapperStyle={{ fontSize: '14px' }} />
                <recharts.Bar dataKey="Orçamento" fill="#3b82f6" name="Orçamento" />
                <recharts.Bar dataKey="Custo Real" fill="#ef4444" name="Custo Real" />
            </recharts.BarChart>
          </recharts.ResponsiveContainer>
        )}
    </Card>
  );
};

export default BudgetChart;
