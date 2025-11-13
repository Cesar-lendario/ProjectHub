import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';
import { KPI_MESSAGES } from '../../constants';
import { LightbulbIcon } from '../ui/Icons';
import { marked } from 'marked';

const RisksAndOpportunities: React.FC = () => {
  const { projects } = useProjectContext();
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { analyzeRisksAndOpportunities } = await import('../../services/openaiService');
        const result = await analyzeRisksAndOpportunities(projects);
        const htmlResult = marked(result) as string;
        setAnalysis(htmlResult);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError(KPI_MESSAGES.error);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-slate-500 dark:text-slate-400 italic">{KPI_MESSAGES.loading}</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    return (
        <div 
          className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: analysis }}
        />
    );
  };

  return (
    <Card className="h-full">
      <div className="flex items-center mb-4">
        <LightbulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Insights com IA</h3>
      </div>
      {renderContent()}
    </Card>
  );
};

export default RisksAndOpportunities;