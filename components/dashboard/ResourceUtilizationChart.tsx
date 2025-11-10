import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';
import { USERS } from '../../constants';

const COLORS = ['#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#2ecc71'];

const ResourceUtilizationChart: React.FC = () => {
  const { projects } = useProjectContext();

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
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ResourceUtilizationChart;