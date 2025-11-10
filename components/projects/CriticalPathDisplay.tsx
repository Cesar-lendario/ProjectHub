import React, { useState, useEffect } from 'react';
import { Project, CriticalPathResult } from '../../types';
import { calculateCriticalPath } from '../../utils/criticalPath';
import { getCriticalPathInsights } from '../../services/geminiService';
import Card from '../ui/Card';
import { CRITICAL_PATH_MESSAGES } from '../../constants';
import { ZapIcon } from '../ui/Icons';

const CriticalPathDisplay: React.FC<{ project: Project }> = ({ project }) => {
  const [criticalPath, setCriticalPath] = useState<CriticalPathResult | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePath = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const pathResult = calculateCriticalPath(project.tasks);
        setCriticalPath(pathResult);

        if (pathResult && pathResult.path.length > 0) {
          const geminiInsights = await getCriticalPathInsights(project, pathResult);
          setInsights(geminiInsights);
        } else {
          setInsights("Não foi possível determinar um caminho crítico para este projeto.");
        }

      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(CRITICAL_PATH_MESSAGES.error);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    analyzePath();
  }, [project]);

  const criticalPathTasks = criticalPath?.path.map(taskId => 
    project.tasks.find(t => t.id === taskId)?.name
  ).filter(Boolean) || [];

  return (
    <Card>
      <div className="flex items-center mb-3">
        <ZapIcon className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-bold text-slate-800">Análise do Caminho Crítico</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h4 className="font-semibold text-slate-700 mb-2">Caminho Mais Longo ({criticalPath?.duration} dias)</h4>
          {criticalPathTasks.length > 0 ? (
            <div className="text-sm text-slate-600 space-y-1">
              {criticalPathTasks.map((taskName, index) => (
                <div key={index} className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-700 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">{index + 1}</span>
                  <span>{taskName}</span>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-slate-500">Nenhuma tarefa forma um caminho crítico.</p>
          )}
        </div>
        <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-700 mb-2">Recomendação com IA</h4>
             {isLoading && <p className="text-slate-500 italic text-sm">{CRITICAL_PATH_MESSAGES.loading}</p>}
             {error && <p className="text-red-500 text-sm">{error}</p>}
             {!isLoading && !error && <p className="text-sm text-slate-600 leading-relaxed">{insights}</p>}
        </div>
      </div>
    </Card>
  );
};

export default CriticalPathDisplay;