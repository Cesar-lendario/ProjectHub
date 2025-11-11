import React from 'react';
import BudgetChart from '../dashboard/BudgetChart';
import ResourceUtilizationChart from '../dashboard/ResourceUtilizationChart';
import RisksAndOpportunities from '../dashboard/RisksAndOpportunities';
import TasksByStatusChart from '../dashboard/TasksByStatusChart';

const ReportsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Relatórios de Desempenho</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-300">Analise o andamento do projeto, utilização de recursos e orçamento.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <BudgetChart />
                <ResourceUtilizationChart />
                <TasksByStatusChart />
                <RisksAndOpportunities />
            </div>
        </div>
    );
};

export default ReportsView;
