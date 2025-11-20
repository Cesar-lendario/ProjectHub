import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { KPI_MESSAGES } from '../../constants';
import { marked } from 'marked';
import { XIcon } from '../ui/Icons';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose }) => {
  const { projects } = useProjectContext();
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !analysis && !error) {
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
    }
  }, [isOpen, projects, analysis, error]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 italic">{KPI_MESSAGES.loading}</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    return (
      <div 
        className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-strong:text-slate-800 dark:prose-strong:text-slate-200"
        dangerouslySetInnerHTML={{ __html: analysis }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Insights com IA</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;
