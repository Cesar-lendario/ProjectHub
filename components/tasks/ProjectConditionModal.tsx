import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Modal from '../ui/Modal';
import { supabase } from '../../services/supabaseClient';

interface ProjectConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

interface ProjectNote {
  id: string;
  project_id: string;
  note_text: string;
  created_at: string;
  created_by: string;
  user_name?: string;
}

const ProjectConditionModal: React.FC<ProjectConditionModalProps> = ({ isOpen, onClose, projectId }) => {
  const { projects, profile } = useProjectContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const isMountedRef = useRef(true);
  const loadingControllerRef = useRef<AbortController | null>(null);

  // Inicializar projeto selecionado quando modal abre
  useEffect(() => {
    if (isOpen) {
      // Se projectId foi passado e é válido, usar ele
      if (projectId && projectId !== 'all') {
        setSelectedProjectId(projectId);
      } else if (projects.length > 0) {
        // Caso contrário, selecionar primeiro projeto da lista
        setSelectedProjectId(projects[0].id);
      } else {
        // Se não há projetos, limpar seleção
        setSelectedProjectId('');
      }
    }
  }, [isOpen, projectId, projects]);

  // Função para carregar notas (usando useCallback para evitar dependências circulares)
  const loadProjectNotes = useCallback(async () => {
    // Cancelar carregamento anterior se existir
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort();
    }
    
    // Criar novo controller para esta operação
    loadingControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError('');
    
    console.log('[ProjectConditionModal] Carregando notas para projeto:', selectedProjectId);
    
    try {
      // Buscar notas
      const { data: notesData, error: notesError } = await (supabase as any)
        .from('project_notes')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('created_at', { ascending: false });

      console.log('[ProjectConditionModal] Resposta da query de notas:', { notesData, notesError });

      if (notesError) {
        console.error('[ProjectConditionModal] Erro na query de notas:', notesError);
        throw new Error(notesError.message || 'Erro desconhecido ao buscar notas');
      }

      if (notesData && notesData.length > 0) {
        console.log('[ProjectConditionModal] Encontradas', notesData.length, 'notas');
        
        // Verificar se ainda está montado antes de continuar
        if (!isMountedRef.current) return;
        
        // Buscar nomes dos usuários separadamente
        const userIds = [...new Set(notesData.map((n: any) => n.created_by))];
        console.log('[ProjectConditionModal] Buscando usuários:', userIds);
        
        const { data: usersData, error: usersError } = await (supabase as any)
          .from('users')
          .select('id, name')
          .in('id', userIds);

        if (usersError) {
          console.error('[ProjectConditionModal] Erro ao buscar usuários:', usersError);
        }
        
        // Verificar novamente se ainda está montado
        if (!isMountedRef.current) return;

        const usersMap = new Map(usersData?.map((u: any) => [u.id, u.name]) || []);

        const notesWithUserName = notesData.map((note: any) => ({
          ...note,
          user_name: usersMap.get(note.created_by) || 'Usuário'
        }));

        console.log('[ProjectConditionModal] Notas com nomes de usuários:', notesWithUserName);
        
        // Só atualizar estado se ainda estiver montado
        if (isMountedRef.current) {
          setNotes(notesWithUserName);
        }
      } else {
        console.log('[ProjectConditionModal] Nenhuma nota encontrada');
        if (isMountedRef.current) {
          setNotes([]);
        }
      }
    } catch (err: any) {
      console.error('[ProjectConditionModal] Erro ao carregar notas:', err);
      const errorMessage = err?.message || 'Erro desconhecido';
      
      // Verificar se é erro de tabela não encontrada
      if (errorMessage.includes('relation "project_notes" does not exist')) {
        setError('A tabela de anotações não existe no banco de dados. Execute o script SQL de criação.');
      } else if (errorMessage.includes('permission denied')) {
        setError('Sem permissão para acessar as anotações. Verifique as políticas RLS no Supabase.');
      } else {
        setError(`Erro ao carregar anotações: ${errorMessage}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      loadingControllerRef.current = null;
      console.log('[ProjectConditionModal] Loading finalizado');
    }
  }, [selectedProjectId]); // Dependência: selectedProjectId

  // Resetar estados quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      // Cancelar qualquer carregamento em andamento
      if (loadingControllerRef.current) {
        loadingControllerRef.current.abort();
        loadingControllerRef.current = null;
      }
      // Resetar estados
      setIsLoading(false);
      setIsSaving(false);
      setError('');
      setNewNote('');
      setNotes([]);
    }
  }, [isOpen]);

  // Carregar notas ao abrir o modal ou mudar de projeto
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isOpen && selectedProjectId && selectedProjectId !== 'all') {
      console.log('[ProjectConditionModal] Iniciando carregamento para projeto:', selectedProjectId);
      loadProjectNotes();
    } else if (isOpen && (!selectedProjectId || selectedProjectId === 'all')) {
      // Se não há projeto válido, garantir que loading está desativado
      console.log('[ProjectConditionModal] Nenhum projeto válido selecionado, desativando loading');
      setIsLoading(false);
      setNotes([]);
    }
    
    return () => {
      isMountedRef.current = false;
      // Cancelar carregamento se modal for fechado durante a operação
      if (loadingControllerRef.current) {
        loadingControllerRef.current.abort();
        loadingControllerRef.current = null;
      }
    };
  }, [isOpen, selectedProjectId, loadProjectNotes]);

  const handleAddNote = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      setError('Por favor, selecione um projeto.');
      return;
    }

    if (!newNote.trim()) {
      setError('Por favor, escreva uma anotação.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const noteData = {
        project_id: selectedProjectId,
        note_text: newNote.trim(),
        created_by: profile?.id,
        created_at: new Date().toISOString(),
      };

      console.log('[ProjectConditionModal] Adicionando nota:', noteData);

      const { error } = await (supabase as any)
        .from('project_notes')
        .insert([noteData]);

      if (error) throw error;

      console.log('[ProjectConditionModal] Nota adicionada com sucesso');

      // Limpar campo e recarregar notas
      setNewNote('');
      await loadProjectNotes();
      
      console.log('[ProjectConditionModal] Notas recarregadas');
    } catch (err) {
      console.error('[ProjectConditionModal] Erro ao adicionar nota:', err);
      setError(`Erro ao salvar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
      console.log('[ProjectConditionModal] isSaving resetado para false');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anotações do Projeto">
      <div className="p-6 space-y-4">
        {/* Seletor de Projeto */}
        <div>
          <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Projeto
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={!!projectId && projectId !== 'all'}
          >
            <option value="">Selecione um projeto</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Campo para adicionar nova anotação */}
        {!isLoading && selectedProjectId && selectedProjectId !== 'all' && (
          <div>
            <label htmlFor="new-note" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Nova Anotação
            </label>
            <textarea
              id="new-note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Digite aqui o estágio atual, observações, decisões tomadas..."
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <button
              onClick={handleAddNote}
              disabled={isSaving || !newNote.trim()}
              className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:text-slate-200 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Adicionando...' : '+ Adicionar Anotação'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Carregando anotações...</p>
          </div>
        )}

        {/* Lista de Anotações */}
        {!isLoading && selectedProjectId && selectedProjectId !== 'all' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Histórico de Anotações
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="text-sm">Nenhuma anotação registrada ainda.</p>
                <p className="text-xs mt-1">Adicione a primeira anotação acima.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {note.user_name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(note.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {note.note_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão Fechar */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectConditionModal;
