
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
  const [duration, setDuration] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para rastrear estado anterior
  const wasOpenRef = useRef(false);
  const lastTaskIdRef = useRef<string | null>(null);

  // Sincronizar campos apenas quando modal abre ou tarefa muda
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    const taskChanged = taskToEdit?.id !== lastTaskIdRef.current;
    
    // Atualizar refs
    wasOpenRef.current = isOpen;
    lastTaskIdRef.current = taskToEdit?.id || null;
    
    // Só sincronizar campos quando:
    // 1. Modal acabou de abrir (transição de fechado para aberto)
    // 2. OU a tarefa em edição mudou
    if (justOpened || taskChanged) {
      console.log('[TaskForm] Sincronizando campos:', { justOpened, taskChanged, taskId: taskToEdit?.id });
      setIsLoading(false);

      if (taskToEdit) {
        setName(taskToEdit.name);
        setDescription(taskToEdit.description);
        setProjectId(taskToEdit.project_id);
        setAssigneeId(taskToEdit.assignee?.id || null);
        setDueDate(taskToEdit.dueDate);
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setDuration(taskToEdit.duration);
      } else {
        // Reset form para nova tarefa
        setName('');
        setDescription('');
        setProjectId(initialProjectId || (projects.length > 0 ? projects[0].id : ''));
        setAssigneeId(null);
        setDueDate(new Date().toISOString().split('T')[0]);
        setPriority(TaskPriority.Medium);
        setStatus(TaskStatus.Pending);
        setDuration(1);
      }
    }
  }, [isOpen, taskToEdit?.id, initialProjectId, projects]);
  
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
    
    setIsLoading(true);
    try {
        await onSave({
          name,
          description,
          project_id: projectId,
          assignee_id: assigneeId,
          dueDate,
          priority,
          status,
          duration,
          dependencies: taskToEdit?.dependencies || [],
        });
    } catch(error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "Could not save task.");
    } finally {
        setIsLoading(false);
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

        {/* Row 2: Data e Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de Início"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Input
            label="Duração (dias)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            placeholder="1"
          />
        </div>

        {/* Row 3: Prioridade e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
