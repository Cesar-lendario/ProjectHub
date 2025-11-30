import React, { useState, FormEvent } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { User } from '../../types';

interface MessageInputProps {
    activeChannel: string;
    currentUser: User;
}

const MessageInput: React.FC<MessageInputProps> = ({ activeChannel, currentUser }) => {
    const { addMessage } = useProjectContext();
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        console.log('[MessageInput] 📤 handleSubmit chamado', {
            content: content,
            contentTrimmed: content.trim(),
            activeChannel,
            currentUserId: currentUser.id,
            isSending
        });
        
        if (!content.trim()) {
            console.log('[MessageInput] ⚠️ Conteúdo vazio, ignorando envio');
            return;
        }
        
        if (isSending) {
            console.log('[MessageInput] ⏳ Já está enviando, ignorando clique duplicado');
            return;
        }
        
        try {
            setIsSending(true);
            console.log('[MessageInput] 🚀 Iniciando envio de mensagem...');
            
            await addMessage({
                sender_id: currentUser.id,
                channel: activeChannel,
                content: content.trim(),
                timestamp: new Date().toISOString(),
            });
            
            console.log('[MessageInput] ✅ Mensagem enviada com sucesso!');
            setContent('');
        } catch (error) {
            console.error("[MessageInput] ❌ Erro ao enviar mensagem:", error);
            alert("Não foi possível enviar a mensagem. Erro: " + (error instanceof Error ? error.message : 'Desconhecido'));
        } finally {
            setIsSending(false);
            console.log('[MessageInput] 🏁 Envio finalizado');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Mensagem em ${activeChannel.startsWith('#') ? activeChannel : 'projeto'}`}
                className="flex-1 border border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-inner shadow-black/20"
                disabled={isSending}
            />
            <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-900/30 hover:from-indigo-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                disabled={!content.trim() || isSending}
            >
                {isSending ? 'Enviando...' : 'Enviar'}
            </button>
        </form>
    );
};

export default MessageInput;