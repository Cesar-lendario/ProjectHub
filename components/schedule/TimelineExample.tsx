import React from 'react';
import Card from '../ui/Card';
import ImplementationTimeline from './ImplementationTimeline';

const TimelineExample: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Exemplos de Cronogramas</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Visualize diferentes modelos de cronogramas para seus projetos.
        </p>
      </div>

      <div className="space-y-8">
        <ImplementationTimeline />
      </div>
    </div>
  );
};

export default TimelineExample;
