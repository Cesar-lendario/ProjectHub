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
  // Inicializar com o projectId se fornecido, senão vazio
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const isMountedRef = useRef(true);
  const loadingControllerRef = useRef<AbortController | null>(null);
  const lastLoadedProjectIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Log quando notes mudar
  useEffect(() => {
    console.log('[DEBUG] 📝 Estado NOTES mudou:', {
      notesCount: notes.length,
      projectIds: [...new Set(notes.map(n => n.project_id))],
      selectedProjectId,
      timestamp: new Date().toISOString()
    });
  }, [notes, selectedProjectId]);

  // Inicializar projeto selecionado quando modal abre
  // IMPORTANTE: NÃO incluir selectedProjectId nas dependências para evitar loop infinito!
  useEffect(() => {
    console.log('[DEBUG] useEffect INICIALIZAR - Estado:', {
      isOpen,
      projectIdProp: projectId,
      selectedProjectId,
      projectsCount: projects.length,
      timestamp: new Date().toISOString()
    });
    
    if (!isOpen) {
      console.log('[DEBUG] Modal fechado, não inicializar projeto');
      return;
    }
    
    // Se projectId foi passado e é válido, usar ele (prioridade máxima)
    if (projectId && projectId !== 'all') {
      console.log('[DEBUG] ⚡ Definindo selectedProjectId como projectId prop:', projectId);
      setSelectedProjectId(projectId);
      return;
    }
    
    // Se não tem projectId mas já tem um selecionado, manter
    if (selectedProjectId && selectedProjectId !== 'all') {
      console.log('[DEBUG] ✅ Mantendo selectedProjectId atual:', selectedProjectId);
      return;
    }
    
    // Caso contrário, selecionar primeiro projeto da lista se disponível
    if (projects.length > 0) {
      const firstProjectId = projects[0].id;
      console.log('[DEBUG] ⚡ Definindo selectedProjectId como primeiro projeto:', firstProjectId);
      setSelectedProjectId(firstProjectId);
      return;
    }
    
    // Se não há projetos, limpar seleção
    console.log('[DEBUG] ⚡ Nenhum projeto disponível, limpando selectedProjectId');
    setSelectedProjectId('');
    
    // REMOVIDO selectedProjectId das dependências para evitar loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projectId, projects]);

  // Função para carregar notas (usando useRef para evitar recriação)
  const loadProjectNotesRef = useRef<((showLoading?: boolean) => Promise<void>) | null>(null);
  
  // Criar função de carregamento que não muda
  useEffect(() => {
    loadProjectNotesRef.current = async (showLoading: boolean = true) => {
      const startTime = performance.now();
      const currentProjectId = selectedProjectId;
      
      console.log('[DEBUG] 📥 loadProjectNotes INICIADO:', {
        currentProjectId,
        showLoading,
        isLoadingRef: isLoadingRef.current,
        lastLoadedProjectId: lastLoadedProjectIdRef.current,
        timestamp: new Date().toISOString()
      });
      
      // Evitar carregamento duplicado para o mesmo projeto
      if (isLoadingRef.current && lastLoadedProjectIdRef.current === currentProjectId) {
        console.log('[DEBUG] ⏭️ Carregamento já em andamento para este projeto, ignorando...');
        return;
      }
      
      // Cancelar carregamento anterior se existir
      if (loadingControllerRef.current) {
        console.log('[DEBUG] 🛑 Cancelando carregamento anterior');
        loadingControllerRef.current.abort();
      }
      
      // Criar novo controller para esta operação
      loadingControllerRef.current = new AbortController();
      
      if (!isMountedRef.current) {
        console.log('[DEBUG] ⚠️ Componente não está montado, abortando');
        return;
      }
      
      // Marcar como carregando
      isLoadingRef.current = true;
      lastLoadedProjectIdRef.current = currentProjectId;
      
      if (showLoading) {
        setIsLoading(true);
      }
      setError('');
      
      // Timeout de segurança para evitar travamento
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
          console.warn('[DEBUG] ⏰ TIMEOUT ao carregar notas (15s)! Tempo decorrido:', elapsedTime, 's');
          if (showLoading) {
            setIsLoading(false);
          }
          loadingControllerRef.current = null;
        }
      }, 15000); // 15 segundos
      
      console.log('[DEBUG] 🚀 Iniciando query para notas do projeto:', currentProjectId);
      const queryStartTime = performance.now();
      
      try {
        // Buscar notas
        const { data: notesData, error: notesError } = await (supabase as any)
          .from('project_notes')
          .select('*')
          .eq('project_id', currentProjectId)
          .order('created_at', { ascending: false });

        const queryElapsedTime = ((performance.now() - queryStartTime) / 1000).toFixed(2);
        console.log('[DEBUG] 📊 Query de notas concluída em', queryElapsedTime, 's:', { 
          notesData: notesData?.length || 0, 
          notesError,
          projectId: currentProjectId
        });

        if (notesError) {
          console.error('[DEBUG] ❌ Erro na query de notas:', notesError);
          throw new Error(notesError.message || 'Erro desconhecido ao buscar notas');
        }

        if (notesData && notesData.length > 0) {
          console.log('[DEBUG] ✅ Encontradas', notesData.length, 'notas');
          
          // Verificar se ainda está montado antes de continuar
          if (!isMountedRef.current) {
            console.log('[DEBUG] ⚠️ Componente desmontado durante busca de notas');
            clearTimeout(timeoutId);
            return;
          }
          
          // Buscar nomes dos usuários separadamente (com timeout)
          const userIds = [...new Set(notesData.map((n: any) => n.created_by))];
          console.log('[DEBUG] 👥 Buscando', userIds.length, 'usuários:', userIds);
          const usersQueryStartTime = performance.now();
          
          try {
            const { data: usersData, error: usersError } = await (supabase as any)
              .from('users')
              .select('id, name')
              .in('id', userIds);

            const usersQueryElapsedTime = ((performance.now() - usersQueryStartTime) / 1000).toFixed(2);
            console.log('[DEBUG] 👥 Query de usuários concluída em', usersQueryElapsedTime, 's:', {
              usersData: usersData?.length || 0,
              usersError
            });

            if (usersError) {
              console.error('[DEBUG] ⚠️ Erro ao buscar usuários (não crítico):', usersError);
              // Não lançar erro, apenas usar valores padrão
            }
            
            // Verificar novamente se ainda está montado
            if (!isMountedRef.current) {
              console.log('[DEBUG] ⚠️ Componente desmontado durante busca de usuários');
              clearTimeout(timeoutId);
              return;
            }

            const usersMap = new Map(usersData?.map((u: any) => [u.id, u.name]) || []);

            const notesWithUserName = notesData.map((note: any) => ({
              ...note,
              user_name: usersMap.get(note.created_by) || 'Usuário'
            }));

            console.log('[DEBUG] 📝 Notas com nomes de usuários preparadas:', notesWithUserName.length);
            
            // Validar que as notas pertencem ao projeto correto antes de atualizar
            const validNotes = notesWithUserName.filter((note: any) => note.project_id === currentProjectId);
            
            // Verificar se o projeto ainda é o mesmo antes de atualizar
            if (isMountedRef.current && currentProjectId === selectedProjectId) {
              console.log('[DEBUG] ✅ Atualizando estado com', validNotes.length, 'notas válidas para projeto:', currentProjectId);
              setNotes(validNotes);
            } else {
              console.warn('[DEBUG] ⚠️ Projeto mudou durante o carregamento, ignorando notas:', {
                projetoCarregado: currentProjectId,
                projetoAtual: selectedProjectId
              });
            }
          } catch (userError) {
            console.error('[DEBUG] ❌ Erro ao buscar usuários (continuando sem nomes):', userError);
            // Continuar mesmo sem nomes de usuários
            if (isMountedRef.current && currentProjectId === selectedProjectId) {
              const notesWithDefaultNames = notesData
                .filter((note: any) => note.project_id === currentProjectId)
                .map((note: any) => ({
                  ...note,
                  user_name: 'Usuário'
                }));
              console.log('[DEBUG] 📝 Usando nomes padrão para', notesWithDefaultNames.length, 'notas');
              setNotes(notesWithDefaultNames);
            }
          }
        } else {
          console.log('[DEBUG] 📭 Nenhuma nota encontrada para projeto:', currentProjectId);
          if (isMountedRef.current) {
            setNotes([]);
          }
        }
        
        clearTimeout(timeoutId);
        const totalElapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
        console.log('[DEBUG] ✅ loadProjectNotes CONCLUÍDO com sucesso em', totalElapsedTime, 's');
      } catch (err: any) {
        clearTimeout(timeoutId);
        const totalElapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
        console.error('[DEBUG] ❌ Erro ao carregar notas (tempo:', totalElapsedTime, 's):', err);
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
        isLoadingRef.current = false;
        if (isMountedRef.current) {
          if (showLoading) {
            setIsLoading(false);
          }
        }
        loadingControllerRef.current = null;
        const totalElapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
        console.log('[DEBUG] 🏁 loadProjectNotes FINALIZADO (finally) - Tempo total:', totalElapsedTime, 's');
      }
    };
  }, [selectedProjectId]); // Atualizar função quando selectedProjectId mudar
  
  // Wrapper para chamar a função do ref
  const loadProjectNotes = useCallback(async (showLoading: boolean = true) => {
    if (loadProjectNotesRef.current) {
      return loadProjectNotesRef.current(showLoading);
    }
  }, []);

  // Resetar estados quando modal fecha
  useEffect(() => {
    console.log('[DEBUG] useEffect RESETAR - isOpen:', isOpen, 'timestamp:', new Date().toISOString());
    
    if (!isOpen) {
      console.log('[DEBUG] ❌ Modal fechando - resetando todos os estados');
      // Cancelar qualquer carregamento em andamento
      if (loadingControllerRef.current) {
        console.log('[DEBUG] 🛑 Abortando carregamento em andamento');
        loadingControllerRef.current.abort();
        loadingControllerRef.current = null;
      }
      // Resetar estados e refs
      isLoadingRef.current = false;
      lastLoadedProjectIdRef.current = null;
      setIsLoading(false);
      setIsSaving(false);
      setDeletingNoteId(null);
      setEditingNoteId(null);
      setEditingNoteText('');
      setIsUpdating(false);
      setError('');
      setNewNote('');
      setNotes([]);
      console.log('[DEBUG] ✅ Todos os estados resetados');
    }
  }, [isOpen]);

  // Controlar montagem do componente - separado para evitar problemas
  useEffect(() => {
    isMountedRef.current = true;
    console.log('[DEBUG] 🟢 Componente MONTADO');
    
    return () => {
      isMountedRef.current = false;
      console.log('[DEBUG] 🔴 Componente DESMONTADO');
      // Cancelar carregamento ao desmontar
      if (loadingControllerRef.current) {
        loadingControllerRef.current.abort();
        loadingControllerRef.current = null;
      }
    };
  }, []); // Executa apenas uma vez na montagem/desmontagem

  // Carregar notas ao abrir o modal ou mudar de projeto
  useEffect(() => {
    console.log('[DEBUG] useEffect CARREGAR - Estado:', {
      isOpen,
      selectedProjectId,
      lastLoadedProjectId: lastLoadedProjectIdRef.current,
      isLoadingRef: isLoadingRef.current,
      isMounted: isMountedRef.current,
      timestamp: new Date().toISOString()
    });
    
    // Se modal não está aberto, não fazer nada
    if (!isOpen) {
      console.log('[DEBUG] ⏸️ Modal fechado, ignorando carregamento');
      return;
    }
    
    // Limpar notas imediatamente quando o projeto muda
    if (selectedProjectId && lastLoadedProjectIdRef.current && lastLoadedProjectIdRef.current !== selectedProjectId) {
      console.log('[DEBUG] 🔄 Projeto mudou - limpando notas antigas:', {
        projetoAnterior: lastLoadedProjectIdRef.current,
        projetoNovo: selectedProjectId
      });
      setNotes([]); // Limpar notas imediatamente
      setIsLoading(false);
      isLoadingRef.current = false;
      // Cancelar edição se estiver editando
      if (editingNoteId) {
        console.log('[DEBUG] ✋ Cancelando edição em andamento');
        setEditingNoteId(null);
        setEditingNoteText('');
      }
    }
    
    // Só carregar se o projeto mudou ou se ainda não foi carregado
    const shouldLoad = isOpen && 
                       selectedProjectId && 
                       selectedProjectId !== 'all' &&
                       lastLoadedProjectIdRef.current !== selectedProjectId &&
                       !isLoadingRef.current;
    
    console.log('[DEBUG] 🤔 Decisão de carregamento:', {
      shouldLoad,
      isOpen,
      selectedProjectId,
      isValid: selectedProjectId !== 'all',
      notLoaded: lastLoadedProjectIdRef.current !== selectedProjectId,
      notLoading: !isLoadingRef.current
    });
    
    if (shouldLoad && loadProjectNotesRef.current) {
      // Adicionar um pequeno delay para evitar carregamentos múltiplos rápidos (debounce)
      console.log('[DEBUG] ⏳ Agendando carregamento com debounce de 50ms...');
      const timeoutId = setTimeout(() => {
        // Verificar todas as condições novamente após o debounce
        if (!isMountedRef.current) {
          console.log('[DEBUG] ⏭️ Componente desmontado durante debounce');
          return;
        }
        if (!isOpen) {
          console.log('[DEBUG] ⏭️ Modal fechou durante debounce');
          return;
        }
        if (!selectedProjectId || selectedProjectId === 'all') {
          console.log('[DEBUG] ⏭️ Projeto inválido durante debounce');
          return;
        }
        
        console.log('[DEBUG] ✅ INICIANDO CARREGAMENTO para projeto:', selectedProjectId);
        // Limpar notas antes de carregar novas
        setNotes([]);
        if (loadProjectNotesRef.current) {
          loadProjectNotesRef.current(true);
        }
      }, 50); // Debounce de 50ms (reduzido de 100ms para carregamento mais rápido)
      
      return () => {
        console.log('[DEBUG] 🧹 Limpando timeout de debounce');
        clearTimeout(timeoutId);
      };
    } else if (isOpen && (!selectedProjectId || selectedProjectId === 'all')) {
      // Se não há projeto válido, garantir que loading está desativado
      console.log('[DEBUG] ⚠️ Nenhum projeto válido selecionado, desativando loading');
      isLoadingRef.current = false;
      lastLoadedProjectIdRef.current = null;
      setIsLoading(false);
      setNotes([]);
    } else {
      console.log('[DEBUG] ⏸️ Carregamento não necessário (já carregado ou já em andamento)');
    }
  }, [isOpen, selectedProjectId, editingNoteId]); // editingNoteId para cancelar edição ao trocar projeto

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

  const canEditNote = useCallback((noteAuthorId: string): boolean => {
    if (!profile) return false;
    // Apenas o autor pode editar (admins podem deletar, mas não editar)
    return profile.id === noteAuthorId;
  }, [profile]);

  const handleStartEdit = (note: ProjectNote) => {
    if (!canEditNote(note.created_by)) {
      setError('Você não tem permissão para editar esta anotação.');
      return;
    }
    setEditingNoteId(note.id);
    setEditingNoteText(note.note_text);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
    setError('');
  };

  const handleUpdateNote = async (noteId: string, noteAuthorId: string) => {
    if (!canEditNote(noteAuthorId)) {
      setError('Você não tem permissão para editar esta anotação.');
      return;
    }

    if (!editingNoteText.trim()) {
      setError('A anotação não pode estar vazia.');
      return;
    }

    // Prevenir múltiplos submits
    if (isUpdating) {
      console.warn('[ProjectConditionModal] Atualização já em andamento, ignorando...');
      return;
    }

    setIsUpdating(true);
    setError('');

    const timeoutId = setTimeout(() => {
      console.error('[ProjectConditionModal] ⚠️ Timeout ao atualizar nota (30s)');
      setIsUpdating(false);
      setError('A operação está demorando muito. Por favor, tente novamente.');
    }, 30000); // 30 segundos de timeout

    try {
      console.log('[ProjectConditionModal] Atualizando nota:', { 
        noteId, 
        noteLength: editingNoteText.trim().length,
        noteAuthorId,
        currentUserId: profile?.id,
        canEdit: canEditNote(noteAuthorId)
      });

      // Verificar se o usuário atual é o autor antes de tentar atualizar
      if (!canEditNote(noteAuthorId)) {
        throw new Error('Você não tem permissão para editar esta anotação.');
      }

      // Primeiro, verificar se a nota existe e pertence ao usuário
      const { data: checkData, error: checkError } = await (supabase as any)
        .from('project_notes')
        .select('id, created_by, note_text')
        .eq('id', noteId)
        .single();

      console.log('[ProjectConditionModal] Verificação pré-update:', { 
        checkData, 
        checkError,
        noteId,
        noteAuthorId,
        currentUserId: profile?.id,
        match: checkData?.created_by === noteAuthorId
      });

      if (checkError) {
        console.error('[ProjectConditionModal] Erro ao verificar nota:', checkError);
        throw checkError;
      }

      if (!checkData || checkData.created_by !== noteAuthorId) {
        throw new Error('A nota não foi encontrada ou você não tem permissão para editá-la.');
      }

      // Agora fazer o update
      const { data, error } = await (supabase as any)
        .from('project_notes')
        .update({ note_text: editingNoteText.trim() })
        .eq('id', noteId)
        .eq('created_by', noteAuthorId) // Adicionar filtro adicional para garantir que é o autor
        .select();

      console.log('[ProjectConditionModal] Resposta do update:', { 
        data, 
        error,
        dataLength: data?.length,
        noteId,
        noteAuthorId
      });

      if (error) {
        console.error('[ProjectConditionModal] Erro do Supabase:', error);
        throw error;
      }

      // Verificar se realmente atualizou
      const wasUpdated = data && data.length > 0;
      
      if (!wasUpdated) {
        console.error('[ProjectConditionModal] ⚠️ ATUALIZAÇÃO BLOQUEADA PELA RLS - nenhum registro foi atualizado');
        throw new Error('A atualização foi bloqueada pelas políticas de segurança (RLS). Verifique se você tem permissão para editar esta anotação.');
      }

      clearTimeout(timeoutId);
      console.log('[ProjectConditionModal] ✅ Nota atualizada com sucesso:', data[0]);

      // Atualizar nota localmente (atualização otimista)
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId 
            ? { ...note, note_text: editingNoteText.trim() }
            : note
        )
      );

      // Cancelar edição
      setEditingNoteId(null);
      setEditingNoteText('');

      // Recarregar notas silenciosamente para garantir sincronização
      try {
        await loadProjectNotes(false);
        console.log('[ProjectConditionModal] ✅ Notas recarregadas após atualização');
      } catch (reloadError) {
        console.error('[ProjectConditionModal] Erro ao recarregar notas (não crítico):', reloadError);
      }
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[ProjectConditionModal] Erro ao atualizar nota:', err);
      
      const errorMessage = err?.message || 'Erro desconhecido';
      if (errorMessage.includes('permission denied') || errorMessage.includes('new row violates row-level security')) {
        setError('Você não tem permissão para editar esta anotação. Verifique as políticas RLS no Supabase.');
      } else {
        setError(`Erro ao atualizar: ${errorMessage}`);
      }
    } finally {
      setIsUpdating(false);
      console.log('[ProjectConditionModal] isUpdating resetado para false');
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
            
            {(() => {
              // Filtrar notas para garantir que pertencem ao projeto selecionado (proteção extra)
              const filteredNotes = notes.filter(note => note.project_id === selectedProjectId);
              
              if (filteredNotes.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Nenhuma anotação registrada ainda.</p>
                    <p className="text-xs mt-1">Adicione a primeira anotação acima.</p>
                  </div>
                );
              }
              
              // Se há notas filtradas mas o array original tinha mais, logar aviso
              if (filteredNotes.length < notes.length) {
                console.warn('[ProjectConditionModal] ⚠️ Notas filtradas:', {
                  total: notes.length,
                  filtradas: filteredNotes.length,
                  projetoSelecionado: selectedProjectId
                });
              }
              
              return (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg relative group"
                  >
                    {editingNoteId === note.id ? (
                      // Modo de edição
                      <div className="space-y-3">
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
                        <textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows={4}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          placeholder="Digite aqui o estágio atual, observações, decisões tomadas..."
                          disabled={isUpdating}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isUpdating && editingNoteText.trim()) {
                                handleUpdateNote(note.id, note.created_by);
                              }
                            }}
                            disabled={isUpdating || !editingNoteText.trim()}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:text-slate-200 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {isUpdating ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <>
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
                            {canEditNote(note.created_by) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isLoading && !isUpdating) {
                                    handleStartEdit(note);
                                  }
                                }}
                                disabled={isLoading || isUpdating || !!editingNoteId}
                                className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                aria-label="Editar anotação"
                                title="Editar anotação"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {canDeleteNote(note.created_by) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (deletingNoteId !== note.id && !isLoading && !isUpdating && !editingNoteId) {
                                    handleDeleteNote(note.id, note.created_by);
                                  }
                                }}
                                disabled={deletingNoteId === note.id || isLoading || !!deletingNoteId || isUpdating || !!editingNoteId}
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
                      </>
                    )}
                  </div>
                  ))}
                </div>
              );
            })()}
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
