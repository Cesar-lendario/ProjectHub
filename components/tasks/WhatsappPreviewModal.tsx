import React, { useState, useEffect } from 'react';
import { WhatsappIcon } from '../ui/Icons';
import Modal from '../ui/Modal';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface WhatsappPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage: string;
  onSend: (message: string) => void;
}

const WhatsappPreviewModal: React.FC<WhatsappPreviewModalProps> = ({ isOpen, onClose, initialMessage, onSend }) => {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const handleSend = () => {
    onSend(message);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="💬 Pré-visualizar Mensagem WhatsApp"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Preview da mensagem em estilo WhatsApp */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <WhatsappIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Pré-visualização WhatsApp
            </span>
          </div>
          <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-green-100 dark:border-green-800">
            <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {message}
            </pre>
          </div>
        </div>

        {/* Editor da mensagem */}
        <Textarea
          label="Edite a mensagem antes de enviar:"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          placeholder="Digite sua mensagem aqui..."
        />

        {/* Footer com Botões */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
          >
            <WhatsappIcon className="h-4 w-4 mr-2" />
            Enviar via WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsappPreviewModal;