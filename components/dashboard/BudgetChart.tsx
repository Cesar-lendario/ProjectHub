// Fix: Implemented the BudgetChart component, which was missing. This file was empty, causing an import error in ReportsView.tsx.
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';

const BudgetChart: React.FC = () => {
  const { projects } = useProjectContext();

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
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Orçamento vs. Custo Real</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} 
                />
                <Tooltip formatter={(value: number | string) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="Orçamento" fill="#3b82f6" name="Orçamento" />
                <Bar dataKey="Custo Real" fill="#ef4444" name="Custo Real" />
            </BarChart>
        </ResponsiveContainer>
    </Card>
  );
};

export default BudgetChart;
