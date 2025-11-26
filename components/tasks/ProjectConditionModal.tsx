import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Modal from '../ui/Modal';
import { supabase } from '../../services/supabaseClient';
import { GlobalRole } from '../../types';

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
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
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
  const loadProjectNotes = useCallback(async (showLoading: boolean = true) => {
    // Cancelar carregamento anterior se existir
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort();
    }
    
    // Criar novo controller para esta operação
    loadingControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    if (showLoading) {
      setIsLoading(true);
    }
    setError('');
    
    // Timeout de segurança para evitar travamento
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        console.warn('[ProjectConditionModal] ⚠️ Timeout ao carregar notas (15s)');
        if (showLoading) {
          setIsLoading(false);
        }
        loadingControllerRef.current = null;
      }
    }, 15000); // 15 segundos
    
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
        if (!isMountedRef.current) {
          clearTimeout(timeoutId);
          return;
        }
        
        // Buscar nomes dos usuários separadamente (com timeout)
        const userIds = [...new Set(notesData.map((n: any) => n.created_by))];
        console.log('[ProjectConditionModal] Buscando usuários:', userIds);
        
        try {
          const { data: usersData, error: usersError } = await (supabase as any)
            .from('users')
            .select('id, name')
            .in('id', userIds);

          if (usersError) {
            console.error('[ProjectConditionModal] Erro ao buscar usuários (não crítico):', usersError);
            // Não lançar erro, apenas usar valores padrão
          }
          
          // Verificar novamente se ainda está montado
          if (!isMountedRef.current) {
            clearTimeout(timeoutId);
            return;
          }

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
        } catch (userError) {
          console.error('[ProjectConditionModal] Erro ao buscar usuários (continuando sem nomes):', userError);
          // Continuar mesmo sem nomes de usuários
          if (isMountedRef.current) {
            const notesWithDefaultNames = notesData.map((note: any) => ({
              ...note,
              user_name: 'Usuário'
            }));
            setNotes(notesWithDefaultNames);
          }
        }
      } else {
        console.log('[ProjectConditionModal] Nenhuma nota encontrada');
        if (isMountedRef.current) {
          setNotes([]);
        }
      }
      
      clearTimeout(timeoutId);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[ProjectConditionModal] Erro ao carregar notas:', err);
      const errorMessage = err?.message || 'Erro desconhecido';
      
      // Verificar se é erro de tabela não encontrada
      if (errorMessage.includes('relation "project_notes" does not exist')) {
        setError('A tabela de anotações não existe no banco de dados. Execute o script SQL de criação.');
      } else if (errorMessage.includes('permission denied')) {
        setError('Sem permissão para acessar as anotações. Verifique as políticas RLS no Supabase.');
      } else {
        // Não mostrar erro se for recarregamento silencioso
        if (showLoading) {
          setError(`Erro ao carregar anotações: ${errorMessage}`);
        }
      }
    } finally {
      if (isMountedRef.current) {
        if (showLoading) {
          setIsLoading(false);
        }
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
      setDeletingNoteId(null);
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

    // Prevenir múltiplos submits
    if (isSaving) {
      console.warn('[ProjectConditionModal] Submit já em andamento, ignorando...');
      return;
    }

    setIsSaving(true);
    setError('');

    const timeoutId = setTimeout(() => {
      console.error('[ProjectConditionModal] ⚠️ Timeout ao adicionar nota (30s)');
      setIsSaving(false);
      setError('A operação está demorando muito. Por favor, tente novamente.');
    }, 30000); // 30 segundos de timeout

    try {
      const noteData = {
        project_id: selectedProjectId,
        note_text: newNote.trim(),
        created_by: profile?.id,
        created_at: new Date().toISOString(),
      };

      console.log('[ProjectConditionModal] Iniciando adição de nota...', { 
        projectId: selectedProjectId,
        noteLength: newNote.trim().length 
      });

      const { data, error } = await (supabase as any)
        .from('project_notes')
        .insert([noteData])
        .select();

      console.log('[ProjectConditionModal] Resposta do insert:', { data, error });

      if (error) {
        console.error('[ProjectConditionModal] Erro do Supabase:', error);
        throw error;
      }

      clearTimeout(timeoutId);
      console.log('[ProjectConditionModal] ✅ Nota adicionada com sucesso:', data);

      // Limpar campo imediatamente (otimista)
      const noteTextToClear = newNote;
      setNewNote('');

      // Recarregar notas silenciosamente (sem mostrar loading)
      try {
        await loadProjectNotes(false);
        console.log('[ProjectConditionModal] ✅ Notas recarregadas após adição');
      } catch (reloadError) {
        console.error('[ProjectConditionModal] Erro ao recarregar notas (não crítico):', reloadError);
        // Não mostrar erro ao usuário, apenas logar
        // A nota já foi adicionada, então está OK
      }
      
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[ProjectConditionModal] ❌ Erro ao adicionar nota:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      console.log('[ProjectConditionModal] isSaving resetado para false');
    }
  };

  const handleDeleteNote = async (noteId: string, noteAuthorId: string) => {
    // Verificar permissões: admin pode deletar qualquer anotação, usuário só pode deletar suas próprias
    const isAdmin = profile?.role === GlobalRole.Admin;
    const isAuthor = profile?.id === noteAuthorId;

    if (!isAdmin && !isAuthor) {
      setError('Você não tem permissão para excluir esta anotação.');
      return;
    }

    // Confirmar exclusão
    if (!window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      return;
    }

    setDeletingNoteId(noteId);
    setError('');

    try {
      console.log('[ProjectConditionModal] Excluindo nota:', noteId);
      console.log('[ProjectConditionModal] Usuário atual:', { id: profile?.id, role: profile?.role });
      console.log('[ProjectConditionModal] Autor da nota:', noteAuthorId);

      const { data, error } = await (supabase as any)
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .select();

      console.log('[ProjectConditionModal] Resposta da exclusão:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('[ProjectConditionModal] Erro do Supabase:', error);
        throw error;
      }

      // Verificar se realmente deletou (data deve conter o registro deletado)
      // Se data estiver vazio e não houver erro, significa que a RLS bloqueou silenciosamente
      const wasDeleted = data && data.length > 0;
      
      if (!wasDeleted) {
        console.error('[ProjectConditionModal] ⚠️ EXCLUSÃO BLOQUEADA PELA RLS - nenhum registro foi deletado');
        console.error('[ProjectConditionModal] Isso geralmente significa que as políticas RLS não permitem a exclusão');
        console.error('[ProjectConditionModal] Verifique: 1) Se o usuário é admin ou autor da nota, 2) Se as políticas RLS estão corretas');
        throw new Error('A exclusão foi bloqueada pelas políticas de segurança (RLS). Verifique se você tem permissão para excluir esta anotação ou se as políticas RLS estão configuradas corretamente no Supabase.');
      }

      console.log('[ProjectConditionModal] ✅ Nota excluída com sucesso:', { deletedCount: data.length, deletedNote: data[0] });

      // Remover a nota da lista localmente (atualização otimista)
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      // Recarregar notas silenciosamente (sem mostrar loading) para garantir sincronização
      await loadProjectNotes(false);
      
      console.log('[ProjectConditionModal] Notas recarregadas após exclusão (silencioso)');
    } catch (err: any) {
      console.error('[ProjectConditionModal] Erro ao excluir nota:', err);
      
      // Se houve erro, recarregar para mostrar o estado correto (sem mostrar loading)
      await loadProjectNotes(false);
      
      const errorMessage = err?.message || 'Erro desconhecido';
      if (errorMessage.includes('permission denied') || errorMessage.includes('new row violates row-level security')) {
        setError('Você não tem permissão para excluir esta anotação. Verifique as políticas RLS no Supabase.');
      } else {
        setError(`Erro ao excluir: ${errorMessage}`);
      }
    } finally {
      setDeletingNoteId(null);
      console.log('[ProjectConditionModal] deletingNoteId resetado');
    }
  };

  const canDeleteNote = useCallback((noteAuthorId: string): boolean => {
    if (!profile) return false;
    const isAdmin = profile.role === GlobalRole.Admin;
    const isAuthor = profile.id === noteAuthorId;
    return isAdmin || isAuthor;
  }, [profile]);

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
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSaving && newNote.trim()) {
                  handleAddNote();
                }
              }}
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg relative group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {note.user_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(note.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {canDeleteNote(note.created_by) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (deletingNoteId !== note.id && !isLoading) {
                                handleDeleteNote(note.id, note.created_by);
                              }
                            }}
                            disabled={deletingNoteId === note.id || isLoading || !!deletingNoteId}
                            className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label="Excluir anotação"
                            title="Excluir anotação"
                          >
                            {deletingNoteId === note.id ? (
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
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
