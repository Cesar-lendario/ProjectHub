import React, { useState, useEffect } from 'react';
import { XIcon, WhatsappIcon } from '../ui/Icons';

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

  if (!isOpen) return null;

  const handleSend = () => {
    onSend(message);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Pré-visualizar Mensagem</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <label htmlFor="whatsapp-message" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Edite a mensagem antes de enviar:
          </label>
          <textarea
            id="whatsapp-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
          />
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 dark:bg-slate-700/30 rounded-b-lg gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
          >
            <WhatsappIcon className="h-5 w-5" /> Enviar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsappPreviewModal;