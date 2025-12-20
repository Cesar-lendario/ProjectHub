
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Project, ProjectStatus, ProjectType } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { autoRecoverySystem } from '../../utils/autoRecoverySystem';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'tasks' | 'team' | 'files'> | Project) => Promise<void>;
  projectToEdit: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.InProgress);
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.Outros);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Registrar callback de limpeza no sistema de recuperação
  useEffect(() => {
    const componentId = `ProjectForm_${Math.random().toString(36).substr(2, 9)}`;
    
    autoRecoverySystem.registerRecoveryCallback(componentId, () => {
      console.log('[ProjectForm] 🔄 Limpeza automática acionada');
      
      // Limpar timeout se existir
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      
      // Resetar loading
      setIsLoading(false);
    });
    
    return () => {
      autoRecoverySystem.unregisterRecoveryCallback(componentId);
      
      // Cleanup ao desmontar
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate);
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
    
    // Prevenir múltiplos submits
    if (isLoading) {
      console.warn('[ProjectForm] Submit já em andamento, ignorando...');
      return;
    }
    
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      console.error('[ProjectForm] ⚠️ Timeout ao salvar projeto (30s)');
      setIsLoading(false);
      alert('A operação está demorando muito. Tentando recuperação automática...');
      
      // Acionar recuperação automática
      autoRecoverySystem.attemptRecovery({
        refreshToken: true,
        resetUIStates: true
      });
    }, 30000); // 30 segundos de timeout
    
    // Salvar referência do timeout
    timeoutIdRef.current = timeoutId;
    
    try {
        const projectData = {
            name,
            description,
            startDate,
            endDate,
            status,
            projectType,
            clientName,
            clientEmail,
        };

        console.log('[ProjectForm] Iniciando salvamento do projeto...', { 
          isEdit: !!projectToEdit, 
          projectId: projectToEdit?.id,
          name 
        });

        if (projectToEdit) {
            console.log('[ProjectForm] Modo de edição - ID do projeto:', projectToEdit.id);
            const updatedProject = { ...projectToEdit, ...projectData };
            console.log('[ProjectForm] Dados completos para atualização:', updatedProject);
            await onSave(updatedProject);
            console.log('[ProjectForm] ✅ Projeto atualizado com sucesso');
        } else {
            console.log('[ProjectForm] Criando novo projeto');
            await onSave(projectData as Omit<Project, 'id' | 'tasks' | 'team' | 'files'>);
            console.log('[ProjectForm] ✅ Novo projeto criado com sucesso');
        }
        
        clearTimeout(timeoutId);
        timeoutIdRef.current = null;
        // Resetar loading e fechar modal apenas após sucesso
        setIsLoading(false);
        onClose();
    } catch(error) {
        clearTimeout(timeoutId);
        timeoutIdRef.current = null;
        console.error("[ProjectForm] ❌ Falha ao salvar projeto:", error);
        
        // Tratamento específico para erros de autenticação
        const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar o projeto. Verifique o console para mais detalhes.";
        
        if (errorMessage.includes('Sessão expirada') || errorMessage.includes('expired') || errorMessage.includes('401')) {
          alert('Sua sessão expirou. A página será recarregada para renovar a autenticação.');
          window.location.reload();
          return;
        }
        
        alert(errorMessage);
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
