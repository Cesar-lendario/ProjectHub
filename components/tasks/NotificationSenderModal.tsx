import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Project, TaskStatus } from '../../types';
import { XIcon, EmailIcon, WhatsappIcon } from '../ui/Icons';
import WhatsappPreviewModal from './WhatsappPreviewModal';

interface NotificationSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSenderModal: React.FC<NotificationSenderModalProps> = ({ isOpen, onClose }) => {
  const { projects, logNotification } = useProjectContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects.length > 0 ? projects[0].id : '');
  const [isWhatsappPreviewOpen, setIsWhatsappPreviewOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const pendingTasks = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.tasks.filter(t => 
      t.status === TaskStatus.Pending || 
      t.status === TaskStatus.ToDo || 
      t.status === TaskStatus.InProgress
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Enviar Lembrete de Tarefas</h2>
            <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Selecione um Projeto</label>
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {selectedProject && (
              <>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-50 text-base">Destinatário</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Contato: <span className="font-medium text-slate-900 dark:text-slate-50">{selectedProject.clientName || 'Não informado'}</span></p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Email: <span className="font-medium text-slate-900 dark:text-slate-50">{selectedProject.clientEmail || 'Não informado'}</span></p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-50 text-base">Tarefas a serem enviadas ({pendingTasks.length})</h3>
                  <div className="mt-2 text-sm text-slate-800 dark:text-slate-50 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-3 bg-white space-y-2">
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map(task => <div key={task.id}>{task.name}</div>)
                    ) : (
                      <div className="text-slate-500 dark:text-slate-400">Nenhuma tarefa pendente ou em andamento para este projeto.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end items-center p-4 border-t bg-slate-50 dark:bg-slate-700/30 rounded-b-lg gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <a
              href={`mailto:${selectedProject?.clientEmail}?subject=Lembrete de Tarefas Pendentes: ${selectedProject?.name}&body=${generateEmailBody()}`}
              onClick={handleSendEmail}
              className={`inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 ${!selectedProject?.clientEmail || pendingTasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={!selectedProject?.clientEmail || pendingTasks.length === 0}
              target="_blank"
              rel="noopener noreferrer"
            >
              <EmailIcon className="h-5 w-5" /> Enviar por Email
            </a>
            <button
              type="button"
              onClick={handleOpenWhatsappPreview}
              className={`inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 ${pendingTasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={pendingTasks.length === 0}
            >
              <WhatsappIcon className="h-5 w-5" /> Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
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