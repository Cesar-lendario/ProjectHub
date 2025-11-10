import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import Card from '../ui/Card';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import { User, Message } from '../../types';

const CommunicationView: React.FC = () => {
    const { projects, messages, users } = useProjectContext();
    const [activeChannel, setActiveChannel] = useState('#geral');
    const currentUser = users[0]; // Mock current user
    const chatEndRef = useRef<HTMLDivElement>(null);

    const channels = useMemo(() => {
        const projectChannels = projects.map(p => ({
            id: p.id,
            name: `# ${p.name}`
        }));
        return [{ id: '#geral', name: '# Geral' }, ...projectChannels];
    }, [projects]);

    const activeChannelMessages = useMemo(() => {
        return messages
            .filter(m => m.channel === activeChannel)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, activeChannel]);

    // Scroll to bottom on new message or channel change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChannelMessages]);

    return (
        <Card className="p-0 h-[calc(100vh-10rem)] flex flex-col">
            <div className="flex justify-between items-center mb-0 p-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Comunicação da Equipe</h2>
                    <p className="mt-1 text-slate-600">Converse em canais gerais ou específicos de projetos.</p>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                {/* Channel List */}
                <div className="w-1/4 border-r border-slate-200 bg-slate-50 overflow-y-auto p-4">
                    <h3 className="font-bold text-slate-700 mb-3">Canais</h3>
                    <ul className="space-y-2">
                        {channels.map(channel => (
                            <li key={channel.id}>
                                <button
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeChannel === channel.id
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {channel.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Chat Area */}
                <div className="w-3/4 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {activeChannelMessages.length > 0 ? (
                            activeChannelMessages.map(msg => (
                                <ChatMessage key={msg.id} message={msg} currentUser={currentUser} />
                            ))
                        ) : (
                            <div className="text-center text-slate-500 pt-10">
                                <p>Nenhuma mensagem neste canal ainda.</p>
                                <p>Seja o primeiro a enviar uma mensagem!</p>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-white">
                        <MessageInput activeChannel={activeChannel} currentUser={currentUser} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CommunicationView;
