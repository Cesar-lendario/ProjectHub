import React, { useState } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { TaskStatus, User } from '../../types';
import TeamMemberCard from './TeamMemberCard';
import { PlusIcon } from '../ui/Icons';
import TeamForm from './TeamForm';

interface TeamViewProps {
    onViewProfile: (user: User) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ onViewProfile }) => {
    const { users, projects, addUser, updateUser, deleteUser } = useProjectContext();
    const allTasks = projects.flatMap(p => p.tasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        if(window.confirm('Tem certeza de que deseja excluir este membro da equipe? Ele será removido de todos os projetos e tarefas.')) {
            deleteUser(userId);
        }
    };

    const handleSaveUser = (userData: Omit<User, 'id'> | User) => {
        if('id' in userData) {
            updateUser(userData);
        } else {
            addUser(userData);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Visão Geral da Equipe</h2>
                        <p className="mt-1 text-slate-600">Acompanhe a carga de trabalho e o desempenho de cada membro da equipe.</p>
                    </div>
                     <button onClick={handleAddUser} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon className="h-4 w-4" />
                        <span>Adicionar Membro</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map(user => {
                        const assignedTasks = allTasks.filter(task => task.assignee?.id === user.id);
                        const completedTasks = assignedTasks.filter(task => task.status === TaskStatus.Done).length;
                        const overdueTasks = assignedTasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done).length;

                        return (
                            <TeamMemberCard 
                                key={user.id}
                                user={user}
                                stats={{
                                    total: assignedTasks.length,
                                    completed: completedTasks,
                                    overdue: overdueTasks,
                                }}
                                onEdit={() => handleEditUser(user)}
                                onDelete={() => handleDeleteUser(user.id)}
                                onView={() => onViewProfile(user)}
                            />
                        );
                    })}
                </div>
            </Card>
            <TeamForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={editingUser}
            />
        </>
    );
};

export default TeamView;