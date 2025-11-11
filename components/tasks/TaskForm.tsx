import React, { useState, useEffect, FormEvent } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { XIcon } from '../ui/Icons';

type EnhancedTask = Task & {
  projectName: string;
  projectId: string;
};

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'assignee'> & { assignee: string | null, projectId: string }) => void;
  taskToEdit: EnhancedTask | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const { projects, users } = useProjectContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [duration, setDuration] = useState<number>(1);

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setAssignee(taskToEdit.assignee?.id || null);
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDuration(taskToEdit.duration);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setAssignee(null);
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority(TaskPriority.Medium);
      setStatus(TaskStatus.Pending);
      setDuration(1);
    }
  }, [taskToEdit, isOpen, projects]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !projectId || !dueDate) {
        alert("Por favor, preencha os campos obrigatórios: Nome da Tarefa, Projeto e Data de Vencimento.");
        return;
    }
    
    onSave({
      name,
      description,
      projectId,
      assignee,
      dueDate,
      priority,
      status,
      duration,
      dependencies: taskToEdit?.dependencies || [],
      comments: taskToEdit?.comments || [],
      attachments: taskToEdit?.attachments || [],
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">{taskToEdit ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
             <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="task-name" className="block text-sm font-medium text-slate-700">Nome da Tarefa</label>
            <input
              type="text"
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="project-id" className="block text-sm font-medium text-slate-700">Projeto</label>
                <select 
                    id="project-id"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                    required
                >
                    <option value="" disabled>Selecione um projeto</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="assignee-id" className="block text-sm font-medium text-slate-700">Responsável</label>
                <select 
                    id="assignee-id"
                    value={assignee || ''}
                    onChange={(e) => setAssignee(e.target.value || null)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                >
                    <option value="">Não atribuído</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-slate-700">Data de Vencimento</label>
                <input 
                    type="date"
                    id="due-date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                    required
                />
            </div>
             <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700">Duração (dias)</label>
                <input 
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                    min="0"
                />
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Prioridade</label>
                <select 
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                <select 
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancelar
            </button>
            <button type="submit" onClick={handleSubmit} className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Salvar Tarefa
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;