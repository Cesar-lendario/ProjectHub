import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus } from '../../types';
import Card from '../ui/Card';

interface NotificationLogTableProps {
  setCurrentView: (view: string) => void;
  setGlobalProjectFilter: (projectId: string) => void;
}

type SortField = 'name' | 'clientName' | 'projectType' | 'activeTasks' | 'lastEmail' | 'lastWhatsapp';
type SortDirection = 'asc' | 'desc';

const NotificationLogTable: React.FC<NotificationLogTableProps> = ({ setCurrentView, setGlobalProjectFilter }) => {
  const { projects } = useProjectContext();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Estados para filtros
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterContato, setFilterContato] = useState('');
  const [filterTipoProjeto, setFilterTipoProjeto] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterSendType, setFilterSendType] = useState<'email' | 'whatsapp'>('email');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRowClick = (projectId: string) => {
    setGlobalProjectFilter(projectId);
    setCurrentView('tasks');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Alternar direção se clicar na mesma coluna
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nova coluna, começar com ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Aplicar filtros e ordenação
  const filteredAndSortedProjects = useMemo(() => {
    // Primeiro, filtrar
    let filtered = projects.filter(project => {
      // Filtro por empresa
      if (filterEmpresa && !project.name?.toLowerCase().includes(filterEmpresa.toLowerCase())) {
        return false;
      }
      
      // Filtro por contato
      if (filterContato && !project.clientName?.toLowerCase().includes(filterContato.toLowerCase())) {
        return false;
      }
      
      // Filtro por tipo de projeto
      if (filterTipoProjeto && filterTipoProjeto !== 'todos' && project.projectType !== filterTipoProjeto) {
        return false;
      }
      
      const sendDate = filterSendType === 'email'
        ? project.lastEmailNotification
        : project.lastWhatsappNotification;

      if (filterDataInicio || filterDataFim) {
        if (!sendDate) {
          return false;
        }

        const dataInicioMs = filterDataInicio ? new Date(filterDataInicio).getTime() : 0;
        const dataFimMs = filterDataFim ? new Date(filterDataFim).getTime() : Number.MAX_SAFE_INTEGER;
        const sendDateMs = new Date(sendDate).getTime();

        if (sendDateMs < dataInicioMs || sendDateMs > dataFimMs) {
          return false;
        }
      }

      return true;
    });
    
    // Depois, ordenar
    return filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sortField) {
        case 'name':
          compareA = (a.name || '').toLowerCase();
          compareB = (b.name || '').toLowerCase();
          break;
        case 'clientName':
          compareA = (a.clientName || '').toLowerCase();
          compareB = (b.clientName || '').toLowerCase();
          break;
        case 'projectType':
          compareA = (a.projectType || '').toLowerCase();
          compareB = (b.projectType || '').toLowerCase();
          break;
        case 'activeTasks':
          compareA = a.tasks.filter(t => 
            t.status === TaskStatus.Pending || 
            t.status === TaskStatus.ToDo || 
            t.status === TaskStatus.InProgress
          ).length;
          compareB = b.tasks.filter(t => 
            t.status === TaskStatus.Pending || 
            t.status === TaskStatus.ToDo || 
            t.status === TaskStatus.InProgress
          ).length;
          break;
        case 'lastEmail':
          compareA = a.lastEmailNotification ? new Date(a.lastEmailNotification).getTime() : 0;
          compareB = b.lastEmailNotification ? new Date(b.lastEmailNotification).getTime() : 0;
          break;
        case 'lastWhatsapp':
          compareA = a.lastWhatsappNotification ? new Date(a.lastWhatsappNotification).getTime() : 0;
          compareB = b.lastWhatsappNotification ? new Date(b.lastWhatsappNotification).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDirection, filterEmpresa, filterContato, filterTipoProjeto, filterDataInicio, filterDataFim, filterSendType]);

  // Obter lista única de tipos de projeto para o filtro
  const projectTypes = useMemo(() => {
    const types = new Set(projects.map(p => p.projectType).filter(Boolean));
    return Array.from(types).sort();
  }, [projects]);

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setFilterEmpresa('');
    setFilterContato('');
    setFilterTipoProjeto('');
    setFilterDataInicio('');
    setFilterDataFim('');
    setFilterSendType('email');
  };

  // Verificar se há algum filtro ativo
  const hasActiveFilters = filterEmpresa || filterContato || filterTipoProjeto || filterDataInicio || filterDataFim;

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <Card className="bg-slate-900/70 border border-slate-700/40 shadow-lg shadow-indigo-900/20 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-slate-50 mb-4 px-1">Histórico de Cobranças</h3>
      
      {/* Filtros */}
      <div className="mb-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro por Empresa */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Empresa</label>
            <input
              type="text"
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
              placeholder="Buscar empresa..."
              className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Filtro por Contato */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contato</label>
            <input
              type="text"
              value={filterContato}
              onChange={(e) => setFilterContato(e.target.value)}
              placeholder="Buscar contato..."
              className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Filtro por Tipo de Projeto */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Projeto</label>
            <select
              value={filterTipoProjeto}
              onChange={(e) => setFilterTipoProjeto(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Filtro por Tipo de Envio */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Envio</label>
            <select
              value={filterSendType}
              onChange={(e) => setFilterSendType(e.target.value as 'email' | 'whatsapp')}
              className="w-full px-3 py-2 text-sm bg-slate-900/60 border border-slate-600 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          
          {/* Botão Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        
        {/* Contador de resultados */}
        <div className="mt-3 text-xs text-slate-400">
          Exibindo <span className="font-semibold text-indigo-400">{filteredAndSortedProjects.length}</span> de <span className="font-semibold">{projects.length}</span> projetos
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-slate-800/40">
        <table className="min-w-full divide-y divide-slate-800/50">
          <thead className="bg-slate-900/60">
            <tr>
              <th 
                scope="col" 
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Empresa
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center">
                  Contato
                  <SortIcon field="clientName" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('projectType')}
              >
                <div className="flex items-center">
                  Tipo Projeto
                  <SortIcon field="projectType" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-5 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('activeTasks')}
              >
                <div className="flex items-center justify-center">
                  Tarefas Ativas
                  <SortIcon field="activeTasks" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('lastEmail')}
              >
                <div className="flex items-center">
                  Data E-mail
                  <SortIcon field="lastEmail" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                onClick={() => handleSort('lastWhatsapp')}
              >
                <div className="flex items-center">
                  Data WhatsApp
                  <SortIcon field="lastWhatsapp" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/30 divide-y divide-slate-800/40">
            {filteredAndSortedProjects.map((project) => {
              const activeTasksCount = project.tasks.filter(t => 
                t.status === TaskStatus.Pending || 
                t.status === TaskStatus.ToDo || 
                t.status === TaskStatus.InProgress
              ).length;

              return (
                <tr 
                  key={project.id} 
                  onClick={() => handleRowClick(project.id)}
                  className="hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-slate-100">{project.name || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.clientName || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.projectType}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-200 text-center font-semibold">{activeTasksCount}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{formatDate(project.lastEmailNotification)}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{formatDate(project.lastWhatsappNotification)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum projeto para exibir.</p>
        )}
      </div>
    </Card>
  );
};

export default NotificationLogTable;