import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { ProjectStatus, TaskStatus } from '../../types';
import KpiCard from './KpiCard';
import TasksByStatusChart from './TasksByStatusChart';
import ResourceUtilizationChart from './ResourceUtilizationChart';
import RisksAndOpportunities from './RisksAndOpportunities';
import RecentProjects from './RecentProjects';
import UpcomingTasks from './UpcomingTasks';
import { FolderIcon, CheckSquareIcon, UsersIcon, AlertCircleIcon } from '../ui/Icons';


const Dashboard: React.FC = () => {
  const { projects, users } = useProjectContext();

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
  
  const allTasks = projects.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === TaskStatus.Done).length;
  const overdueTasks = allTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">Visão geral do progresso dos seus projetos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
            title="Total de Projetos" 
            value={totalProjects} 
            icon={FolderIcon} 
            iconColorClass="text-blue-500" 
            change={`${inProgressProjects} em andamento`}
        />
        <KpiCard 
            title="Total de Tarefas" 
            value={totalTasks} 
            icon={CheckSquareIcon} 
            iconColorClass="text-green-500" 
            change={`${completedTasks} concluídas`}
        />
         <KpiCard 
            title="Tarefas Atrasadas" 
            value={overdueTasks} 
            icon={AlertCircleIcon} 
            iconColorClass="text-red-500" 
        />
        <KpiCard 
            title="Membros da Equipe" 
            value={users.length} 
            icon={UsersIcon} 
            iconColorClass="text-purple-500" 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TasksByStatusChart />
        <div className="space-y-6">
          <RisksAndOpportunities />
          <ResourceUtilizationChart />
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentProjects />
        <UpcomingTasks />
      </div>
    </div>
  );
};

export default Dashboard;