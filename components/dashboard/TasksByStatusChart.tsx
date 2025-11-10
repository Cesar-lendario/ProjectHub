import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

const TasksByStatusChart: React.FC = () => {
  const { projects } = useProjectContext();

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
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey={TaskStatus.ToDo} stackId="a" fill="#38bdf8" name="A Fazer" />
                <Bar dataKey={TaskStatus.InProgress} stackId="a" fill="#f59e0b" name="Em Andamento" />
                <Bar dataKey={TaskStatus.Done} stackId="a" fill="#10b981" name="Concluído" />
            </BarChart>
        </ResponsiveContainer>
    </Card>
  );
};

export default TasksByStatusChart;