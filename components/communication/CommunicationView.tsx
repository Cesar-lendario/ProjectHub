import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';

const CommunicationView: React.FC = () => {
    const { projects, messages, markMessagesAsRead } = useProjectContext();
    const { profile } = useAuth(); // Use authenticated user
    const [activeChannel, setActiveChannel] = useState('#geral');
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

    // Contar mensagens não lidas por canal (excluindo as do próprio usuário)
    const unreadCountByChannel = useMemo(() => {
        const counts: { [key: string]: number } = {};
        messages.forEach(msg => {
            if (!msg.isRead && msg.sender_id !== profile?.id) {
                counts[msg.channel] = (counts[msg.channel] || 0) + 1;
            }
        });
        return counts;
    }, [messages, profile?.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChannelMessages]);

    // Marcar mensagens como lidas quando o usuário visualizar um canal
    useEffect(() => {
        if (profile?.id && activeChannel) {
            // Chamada assíncrona para marcar mensagens como lidas
            const markAsRead = async () => {
                try {
                    await markMessagesAsRead(activeChannel, profile.id);
                } catch (error) {
                    console.error('Erro ao marcar mensagens como lidas:', error);
                }
            };
            markAsRead();
        }
    }, [activeChannel, profile?.id, markMessagesAsRead]);

    if (!profile) {
        return (
            <Card className="h-[calc(100vh-10rem)] flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">Carregando perfil do usuário...</p>
            </Card>
        );
    }

    return (
        <Card className="p-0 h-[calc(100vh-10rem)] flex flex-col bg-slate-900/70 border border-slate-700/40 shadow-lg shadow-indigo-900/20 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-0 p-6 border-b border-slate-700/40 bg-slate-900/70">
                <div>
                    <h2 className="text-2xl font-bold text-slate-50">Comunicação da Equipe</h2>
                    <p className="mt-1 text-slate-400 text-sm">Converse em canais gerais ou específicos de projetos.</p>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden divide-x divide-slate-800/40">
                <div className="w-1/4 bg-slate-900/40 overflow-y-auto p-5">
                    <h3 className="font-semibold text-slate-300 uppercase tracking-wide text-xs mb-4">Canais</h3>
                    <ul className="space-y-3">
                        {channels.map(channel => {
                            const unreadCount = unreadCountByChannel[channel.id] || 0;
                            return (
                                <li key={channel.id}>
                                    <button
                                        onClick={() => setActiveChannel(channel.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-between ${
                                            activeChannel === channel.id
                                                ? 'bg-indigo-500/20 text-indigo-100 border-indigo-400/60 shadow-lg shadow-indigo-500/20'
                                                : 'text-slate-300 border-transparent hover:bg-slate-800/70 hover:text-white'
                                        }`}
                                    >
                                        <span>{channel.name}</span>
                                        {unreadCount > 0 && (
                                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="w-3/4 flex flex-col bg-slate-900/30">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                        {activeChannelMessages.length > 0 ? (
                            activeChannelMessages.map(msg => (
                                <ChatMessage key={msg.id} message={msg} currentUser={profile} />
                            ))
                        ) : (
                            <div className="text-center text-slate-400 pt-10 text-sm">
                                <p className="font-medium text-slate-200">Nenhuma mensagem neste canal ainda.</p>
                                <p>Seja o primeiro a enviar uma mensagem!</p>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-5 border-t border-slate-800/40 bg-slate-900/80">
                        <MessageInput activeChannel={activeChannel} currentUser={profile} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CommunicationView;