
import React, { useState, useEffect, FormEvent } from 'react';
import { Project, ProjectStatus, ProjectType } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

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
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={projectToEdit ? 'Editar Projeto' : 'Adicionar Novo Projeto'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome da Empresa"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Tech Solutions Ltda"
          />
          <Select
            label="Tipo de Projeto"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            options={Object.values(ProjectType).map(type => ({ value: type, label: type }))}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome do Contato"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nome do responsável"
          />
          <Input
            label="Email do Contato"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="email@empresa.com"
          />
        </div>

        {/* Descrição */}
        <Textarea
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descreva os objetivos e escopo do projeto..."
        />

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Data de Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Orçamento (R$)"
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            min="0"
            placeholder="0.00"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={Object.values(ProjectStatus).map(s => ({ value: s, label: s }))}
          />
        </div>

        {/* Footer com Botões */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Projeto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
