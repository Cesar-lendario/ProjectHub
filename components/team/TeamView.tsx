import React from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { TaskStatus, User } from '../../types';
import TeamMemberCard from './TeamMemberCard';

interface TeamViewProps {
    onViewProfile: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onAddUser: () => void;
    isAdmin: boolean;
}

const TeamView: React.FC<TeamViewProps> = ({ onViewProfile, onEditUser, onDeleteUser, onAddUser, isAdmin }) => {
    const { users, projects } = useProjectContext();
    const { profile } = useAuth();
    const allTasks = projects.flatMap(p => p.tasks);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Visão Geral da Equipe</h2>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">Acompanhe a carga de trabalho e o desempenho de cada membro da equipe.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={onAddUser}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
                        >
                            + Novo Membro
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map(user => {
                        const assignedTasks = allTasks.filter(task => task.assignee?.id === user.id);
                        const completedTasks = assignedTasks.filter(task => task.status === TaskStatus.Done).length;
                        const overdueTasks = assignedTasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done).length;

                        // Se for o próprio usuário logado, usar o profile do Auth (tem email correto)
                        const displayUser = user.id === profile?.id ? profile : user;

                        return (
                            <TeamMemberCard 
                                key={user.id}
                                user={displayUser}
                                stats={{
                                    total: assignedTasks.length,
                                    completed: completedTasks,
                                    overdue: overdueTasks,
                                }}
                                onEdit={() => onEditUser(displayUser)}
                                onDelete={() => onDeleteUser(user.id)}
                                onView={() => onViewProfile(displayUser)}
                                isAdmin={isAdmin}
                            />
                        );
                    })}
                </div>
            </Card>
        </>
    );
};

export default TeamView;