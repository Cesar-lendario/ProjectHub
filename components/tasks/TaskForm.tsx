
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

type EnhancedTask = Task & {
  projectName: string;
};

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => Promise<void>;
  taskToEdit: EnhancedTask | null;
  initialProjectId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit, initialProjectId }) => {
  const { projects, users } = useProjectContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para rastrear estado anterior
  const wasOpenRef = useRef(false);
  const lastTaskIdRef = useRef<string | null>(null);

  // Sincronizar campos apenas quando modal abre ou tarefa muda
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    const taskChanged = taskToEdit?.id !== lastTaskIdRef.current;
    
    // Só sincronizar campos quando:
    // 1. Modal acabou de abrir (transição de fechado para aberto)
    // 2. OU a tarefa em edição mudou
    if (justOpened || taskChanged) {
      console.log('[TaskForm] Sincronizando campos:', { justOpened, taskChanged, taskId: taskToEdit?.id });
      
      // Atualizar refs APENAS quando sincronizamos
      wasOpenRef.current = isOpen;
      lastTaskIdRef.current = taskToEdit?.id || null;
      
      setIsLoading(false);

      if (taskToEdit) {
        setName(taskToEdit.name);
        setDescription(taskToEdit.description);
        setProjectId(taskToEdit.project_id);
        setAssigneeId(taskToEdit.assignee?.id || null);
        setDueDate(taskToEdit.dueDate);
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
      } else {
        // Reset form para nova tarefa
        // Usar projects[0] apenas se projects já estiver carregado
        const defaultProjectId = initialProjectId || (projects.length > 0 ? projects[0].id : '');
        setName('');
        setDescription('');
        setProjectId(defaultProjectId);
        setAssigneeId(null);
        setDueDate(new Date().toISOString().split('T')[0]);
        setPriority(TaskPriority.Medium);
        setStatus(TaskStatus.Pending);
      }
    }
    
    // Atualizar wasOpenRef quando modal fecha
    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
    // Remover 'projects' das dependências para evitar re-renderizações desnecessárias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, taskToEdit?.id, initialProjectId]);
  
  // Reset loading quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !projectId || !dueDate) {
        alert("Por favor, preencha os campos obrigatórios: Nome da Tarefa, Projeto e Data de Início.");
        return;
    }
    
    // Prevenir múltiplos submits
    if (isLoading) {
      console.warn('[TaskForm] Submit já em andamento, ignorando...');
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.error('[TaskForm] ⚠️ Timeout ao salvar tarefa após', elapsed, 'segundos');
      setIsLoading(false);
      
      // Verificar se é problema de conexão ou servidor
      const errorMsg = elapsed >= 30 
        ? 'A operação está demorando muito. Isso pode indicar:\n\n• Problema de conexão com a internet\n• Servidor sobrecarregado\n• Token de autenticação expirado\n\nPor favor, verifique sua conexão e tente novamente. Se o problema persistir, recarregue a página (Ctrl+Shift+R).'
        : 'A operação está demorando mais que o esperado. Por favor, tente novamente.';
      
      alert(errorMsg);
    }, 30000); // 30 segundos de timeout
    
    try {
        console.log('[TaskForm] Iniciando salvamento da tarefa...', { 
          isEdit: !!taskToEdit, 
          taskId: taskToEdit?.id,
          name,
          projectId 
        });
        
        await onSave({
          name,
          description,
          project_id: projectId,
          assignee_id: assigneeId,
          dueDate,
          priority,
          status,
          duration: 1, // Valor padrão fixo
          dependencies: taskToEdit?.dependencies || [],
        });
        
        clearTimeout(timeoutId);
        console.log('[TaskForm] ✅ Tarefa salva com sucesso');
        
        // Resetar loading e fechar modal após sucesso
        setIsLoading(false);
        // O modal será fechado pelo TaskList, mas garantimos que o loading seja resetado
    } catch(error) {
        clearTimeout(timeoutId);
        console.error('[TaskForm] ❌ Erro ao salvar tarefa:', error);
        
        // Tratamento específico para erros de autenticação
        const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar a tarefa.";
        
        if (errorMessage.includes('Sessão expirada') || errorMessage.includes('expired') || errorMessage.includes('401')) {
          alert('Sua sessão expirou. A página será recarregada para renovar a autenticação.');
          window.location.reload();
          return;
        }
        
        alert(errorMessage);
        setIsLoading(false); // Resetar loading em caso de erro
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={taskToEdit ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Nome da Tarefa */}
        <Input
          label="Nome da Tarefa"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Implementar login de usuário"
        />

        {/* Descrição */}
        <Textarea
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descreva os detalhes da tarefa..."
        />

        {/* Row 1: Projeto e Responsável */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Projeto"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Selecione um projeto' },
              ...projects.map(project => ({ value: project.id, label: project.name }))
            ]}
            required
          />
          <Select
            label="Responsável"
            value={assigneeId || ''}
            onChange={(e) => setAssigneeId(e.target.value || null)}
            options={[
              { value: '', label: 'Não atribuído' },
              ...users.map(user => ({ value: user.id, label: user.name }))
            ]}
          />
        </div>

        {/* Row 2: Data de Início, Prioridade e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Data de Início"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={Object.values(TaskPriority).map(p => ({ value: p, label: p }))}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={Object.values(TaskStatus).map(s => ({ value: s, label: s }))}
          />
        </div>

        {/* Footer com Botões */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
