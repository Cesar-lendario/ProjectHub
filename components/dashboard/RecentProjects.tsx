import React from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

interface RecentProjectsProps {
  onNavigateToProjects?: () => void;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ onNavigateToProjects }) => {
  const { projects } = useProjectContext();

  // Sort projects by start date, most recent first, and take the top 5
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Projetos Recentes</h3>
        <button 
          onClick={onNavigateToProjects}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Ver todos
        </button>
      </div>
      <div className="space-y-3">
        {recentProjects.map(project => {
          const progress = project.tasks.length > 0
            ? (project.tasks.filter(t => t.status === TaskStatus.Done).length / project.tasks.length) * 100
            : 0;

          return (
            <div key={project.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:bg-slate-700/50 transition-colors">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-slate-800 dark:text-slate-50 truncate">{project.name}</p>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
       {recentProjects.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum projeto foi adicionado ainda.</p>}
    </Card>
  );
};

export default RecentProjects;
