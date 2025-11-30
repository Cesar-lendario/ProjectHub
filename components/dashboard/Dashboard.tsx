import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { ProjectStatus, TaskStatus } from '../../types';
import KpiCard from './KpiCard';
import TasksByStatusChart from './TasksByStatusChart';
import ResourceUtilizationChart from './ResourceUtilizationChart';
import RecentProjects from './RecentProjects';
import UpcomingTasks from './UpcomingTasks';
import InsightsModal from './InsightsModal';
import { FolderIcon, CheckSquareIcon, UsersIcon, AlertCircleIcon } from '../ui/Icons';

interface DashboardProps {
  onNavigateToProjects?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToTasksWithProject?: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToProjects, onNavigateToTasks, onNavigateToTasksWithProject }) => {
  const { projects, users } = useProjectContext();
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
  
  const allTasks = projects.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === TaskStatus.Done).length;
  const inProgressTasks = allTasks.filter(t => t.status === TaskStatus.InProgress).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Visão geral do progresso dos seus projetos.</p>
        </div>
        <button
          onClick={() => setIsInsightsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Insights com IA
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            title="Tarefas em Andamento" 
            value={inProgressTasks} 
            icon={AlertCircleIcon} 
            iconColorClass="text-blue-500" 
        />
        <KpiCard 
            title="Membros da Equipe" 
            value={users.length} 
            icon={UsersIcon} 
            iconColorClass="text-purple-500" 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TasksByStatusChart />
        <ResourceUtilizationChart />
      </div>
      
      {/* Second Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentProjects 
          onNavigateToProjects={onNavigateToProjects} 
          onNavigateToTasksWithProject={onNavigateToTasksWithProject}
        />
        <UpcomingTasks 
          onNavigateToTasks={onNavigateToTasks}
          onNavigateToTasksWithProject={onNavigateToTasksWithProject}
        />
      </div>

      {/* Insights Modal */}
      <InsightsModal 
        isOpen={isInsightsModalOpen} 
        onClose={() => setIsInsightsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;