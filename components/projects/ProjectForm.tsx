
import React, { useState, useEffect, FormEvent } from 'react';
import { Project, ProjectStatus, ProjectType } from '../../types';
import { XIcon } from '../ui/Icons';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'tasks' | 'team' | 'files' | 'actualCost'> | Project) => Promise<void>;
  projectToEdit: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.InProgress);
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.Outros);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate);
      setBudget(projectToEdit.budget);
      setStatus(projectToEdit.status);
      setProjectType(projectToEdit.projectType || ProjectType.Outros);
      setClientName(projectToEdit.clientName || '');
      setClientEmail(projectToEdit.clientEmail || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setName('');
      setDescription('');
      setStartDate(today);
      setEndDate(nextMonth.toISOString().split('T')[0]);
      setBudget(0);
      setStatus(ProjectStatus.InProgress);
      setProjectType(ProjectType.Outros);
      setClientName('');
      setClientEmail('');
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      alert("Por favor, preencha os campos obrigatórios: Nome, Data de Início e Data de Fim.");
      return;
    }
    
    setIsLoading(true);
    try {
        const projectData = {
            name,
            description,
            startDate,
            endDate,
            budget,
            status,
            projectType,
            clientName,
            clientEmail,
        };

        if (projectToEdit) {
            await onSave({ ...projectToEdit, ...projectData });
        } else {
            await onSave(projectData as Omit<Project, 'id' | 'tasks' | 'team' | 'files' | 'actualCost'>);
        }
        onClose();
    } catch(error) {
        console.error("Failed to save project", error);
        alert(error instanceof Error ? error.message : "Could not save project");
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">{projectToEdit ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50">
             <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome da Empresa</label>
                <input
                  type="text" id="project-name" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                  required
                />
              </div>
               <div>
                  <label htmlFor="project-type" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo de Projeto</label>
                  <select id="project-type" value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                  >
                    {Object.values(ProjectType).map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome do Contato</label>
                <input
                  type="text" id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email do Contato</label>
                <input
                  type="email" id="client-email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                />
              </div>
          </div>
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Descrição</label>
            <textarea
              id="project-description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Data de Início</label>
              <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Data de Fim</label>
              <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Orçamento ($)</label>
              <input type="number" id="budget" value={budget} onChange={(e) => setBudget(Number(e.target.value))} min="0"
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
              >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 dark:bg-slate-700/30 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
