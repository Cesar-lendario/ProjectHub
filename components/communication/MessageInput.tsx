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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            addMessage({
                sender: currentUser,
                channel: activeChannel,
                content: content.trim(),
                timestamp: new Date().toISOString()
            });
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Mensagem em ${activeChannel.startsWith('#') ? activeChannel : 'projeto'}`}
                className="flex-1 border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
            />
            <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                disabled={!content.trim()}
            >
                Enviar
            </button>
        </form>
    );
};

export default MessageInput;