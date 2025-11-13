import React from 'react';
import { Message, User } from '../../types';

interface ChatMessageProps {
    message: Message;
    currentUser: User;
}

const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUser }) => {
    const isCurrentUser = message.sender.id === currentUser.id;

    return (
        <div className={`flex items-start gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <img 
                src={message.sender.avatar} 
                alt={message.sender.name} 
                className="w-9 h-9 rounded-full flex-shrink-0 ring-2 ring-slate-800/60"
            />
            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-xl shadow-lg backdrop-blur-sm ${isCurrentUser ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-slate-800/80 text-slate-100 border border-slate-700/40'}`}>
                    <p className={`font-semibold text-xs uppercase tracking-wide mb-2 ${isCurrentUser ? 'text-indigo-100/80' : 'text-slate-300/90'}`}>
                        {message.sender.name}
                    </p>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-slate-500 mt-2">
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default ChatMessage;
