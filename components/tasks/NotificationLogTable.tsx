import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';

interface NotificationLogTableProps {
  setCurrentView: (view: string) => void;
  setGlobalProjectFilter: (projectId: string) => void;
}

type SortField = 'name' | 'clientName' | 'projectType';
type SortDirection = 'asc' | 'desc';


const NotificationLogTable: React.FC<NotificationLogTableProps> = ({ setCurrentView, setGlobalProjectFilter }) => {
  const { projects } = useProjectContext();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Estados para filtros
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterContato, setFilterContato] = useState('');
  const [filterTipoProjeto, setFilterTipoProjeto] = useState('');

  // Estados para observações (começam vazios - não carrega do banco)
  const [projectNotes, setProjectNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Aplicar filtros e ordenação
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      if (filterEmpresa && !project.name?.toLowerCase().includes(filterEmpresa.toLowerCase())) {
        return false;
      }

      if (filterContato && !project.clientName?.toLowerCase().includes(filterContato.toLowerCase())) {
        return false;
      }

      if (filterTipoProjeto && filterTipoProjeto !== 'todos' && project.projectType !== filterTipoProjeto) {
        return false;
      }

      return true;
    });

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
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDirection, filterEmpresa, filterContato, filterTipoProjeto]);

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
  };

  // Verificar se há algum filtro ativo
  const hasActiveFilters = filterEmpresa || filterContato || filterTipoProjeto;

  // Funções para gerenciar observações (apenas localmente, sem banco)
  const handleEditNote = (projectId: string) => {
    const existingNote = projectNotes[projectId] || '';
    setNoteText(existingNote);
    setEditingNote(projectId);
  };

  const handleSaveNote = (projectId: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: noteText
    }));
    setEditingNote(null);
    setNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
  };

  const handleRowClick = (projectId: string, e: React.MouseEvent) => {
    // Não navegar se estiver clicando na área de observação
    if ((e.target as HTMLElement).closest('.observation-cell')) {
      return;
    }
    setGlobalProjectFilter(projectId);
    setCurrentView('tasks');
  };

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
                className="px-5 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  Observação
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/30 divide-y divide-slate-800/40">
            {filteredAndSortedProjects.map((project) => {
              const existingNote = projectNotes[project.id];
              const isEditing = editingNote === project.id;

              return (
                <tr
                  key={project.id}
                  onClick={(e) => handleRowClick(project.id, e)}
                  className="hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-slate-100">{project.name || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.clientName || 'N/A'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-300">{project.projectType}</td>
                  <td className="px-5 py-3 text-sm text-slate-300 observation-cell min-w-[300px]">
                    {isEditing ? (
                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Digite a observação..."
                          className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNote(project.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-start gap-2 group cursor-pointer min-h-[40px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(project.id);
                        }}
                      >
                        <div className="flex-1">
                          {existingNote ? (
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{existingNote}</p>
                          ) : (
                            <p className="text-slate-500 text-sm">&nbsp;</p>
                          )}
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded"
                          title={existingNote ? "Editar observação" : "Adicionar observação"}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
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