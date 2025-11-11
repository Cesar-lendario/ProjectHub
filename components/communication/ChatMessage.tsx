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
        <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <img 
                src={message.sender.avatar} 
                alt={message.sender.name} 
                className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-lg max-w-md ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    <p className={`font-bold text-sm mb-1 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-600'}`}>
                        {message.sender.name}
                    </p>
                    <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default ChatMessage;
