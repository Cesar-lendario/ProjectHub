import React, { useState, useMemo, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, TaskStatus } from '../../types';
import { EmailIcon, WhatsappIcon } from '../ui/Icons';
import WhatsappPreviewModal from './WhatsappPreviewModal';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface NotificationSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
}

const NotificationSenderModal: React.FC<NotificationSenderModalProps> = ({ isOpen, onClose, initialProjectId }) => {
  const { projects, logNotification } = useProjectContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || (projects.length > 0 ? projects[0].id : ''));

  const [isWhatsappPreviewOpen, setIsWhatsappPreviewOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Sincronizar o projeto selecionado com o filtro atual da tela sempre que o modal abrir
  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [isOpen, initialProjectId, projects]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const pendingTasks = useMemo(() => {
    if (!selectedProject) return [];
    // Considerar apenas tarefas das colunas "Pendente" e "A Fazer" para lembretes
    return selectedProject.tasks.filter(t => 
      t.status === TaskStatus.Pending || 
      t.status === TaskStatus.ToDo
    );
  }, [selectedProject]);

  const generateEmailBody = () => {
    if (!selectedProject) return '';
    const taskList = pendingTasks.map(task => `- ${task.name} (Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR')})`).join('\n');
    return encodeURIComponent(`Olá ${selectedProject.clientName || 'Contato'},\n\nEste é um lembrete amigável sobre as seguintes tarefas pendentes para a empresa "${selectedProject.name}":\n\n${taskList}\n\nAtenciosamente,\nEquipe ProjectHub`);
  };

  const generateWhatsappMessage = () => {
    if (!selectedProject) return '';
    const taskList = pendingTasks.map(task => `- *${task.name}* (Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR')})`).join('\n');
    return `Olá ${selectedProject.clientName || 'Contato'},\n\nLembrete sobre as tarefas pendentes para a empresa *${selectedProject.name}*:\n\n${taskList}\n\nObrigado!`;
  };

  const handleOpenWhatsappPreview = () => {
    if (pendingTasks.length === 0) return;
    setWhatsappMessage(generateWhatsappMessage());
    setIsWhatsappPreviewOpen(true);
  };

  const handleSendWhatsapp = (finalMessage: string) => {
    if (!selectedProject) return;
    const encodedMessage = encodeURIComponent(finalMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    logNotification(selectedProject.id, 'whatsapp');
    setIsWhatsappPreviewOpen(false);
    onClose();
  };
  
  const handleSendEmail = () => {
    if (!selectedProject || !selectedProject.clientEmail || pendingTasks.length === 0) return;
    logNotification(selectedProject.id, 'email');
    onClose();
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="📧 Enviar Lembrete de Tarefas"
        size="2xl"
      >
        <div className="p-6 space-y-6">
          {/* Seleção de Projeto */}
          <Select
            label="Selecione um Projeto"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
          />

          {selectedProject && (
            <>
              {/* Informações do Destinatário */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-800 dark:text-slate-50 text-base mb-3">📧 Destinatário</h3>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Contato:</span> 
                    <span className="ml-2 text-slate-900 dark:text-slate-50">
                      {selectedProject.clientName || 'Não informado'}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Email:</span> 
                    <span className="ml-2 text-slate-900 dark:text-slate-50">
                      {selectedProject.clientEmail || 'Não informado'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Lista de Tarefas */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-50 text-base mb-3">
                  📋 Tarefas a serem enviadas ({pendingTasks.length})
                </h3>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-700/50 space-y-2">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
                        <span className="text-slate-800 dark:text-slate-200">{task.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs ml-auto">
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400 text-center py-4">
                      ✅ Nenhuma tarefa em "Pendente" ou "A Fazer" para este projeto.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer com Botões */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            
            <a
              href={`mailto:${selectedProject?.clientEmail}?subject=Lembrete de Tarefas Pendentes: ${selectedProject?.name}&body=${generateEmailBody()}`}
              onClick={handleSendEmail}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all ${!selectedProject?.clientEmail || pendingTasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={!selectedProject?.clientEmail || pendingTasks.length === 0}
              target="_blank"
              rel="noopener noreferrer"
            >
              <EmailIcon className="h-4 w-4" /> 
              Enviar por Email
            </a>
            
            <Button
              type="button"
              onClick={handleOpenWhatsappPreview}
              disabled={pendingTasks.length === 0}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
            >
              <WhatsappIcon className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </div>
        </div>
      </Modal>
      <WhatsappPreviewModal
        isOpen={isWhatsappPreviewOpen}
        onClose={() => setIsWhatsappPreviewOpen(false)}
        initialMessage={whatsappMessage}
        onSend={handleSendWhatsapp}
      />
    </>
  );
};

export default NotificationSenderModal;