import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { User, GlobalRole } from '../../types';
import TeamView from './TeamView';
import UserProfileView from './UserProfileView';
import TeamForm from './TeamForm';

const TeamManagementView: React.FC = () => {
    const { users, updateUser, deleteUser } = useProjectContext();
    const { profile } = useAuth();
    const [view, setView] = useState<'list' | 'profile'>('list');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const isGlobalAdmin = profile?.role === GlobalRole.Admin;

    const handleViewProfile = (user: User) => {
        setSelectedUser(user);
        setView('profile');
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        setView('list');
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (profile?.id === userId) {
            alert("Você não pode excluir seu próprio perfil.");
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir este usuário? A conta de autenticação não será removida, apenas o perfil.')) {
            try {
                await deleteUser(userId);
                if (selectedUser?.id === userId) {
                    handleBackToList();
                }
            } catch (error) {
                console.error(error);
                alert(error instanceof Error ? error.message : 'Não foi possível excluir o usuário.');
            }
        }
    };
    
    const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
        try {
            if ('id' in userData) {
                // Rule: Only one admin allowed
                if (userData.role === GlobalRole.Admin) {
                    const otherAdmin = users.find(u => u.role === GlobalRole.Admin && u.id !== userData.id);
                    if (otherAdmin) {
                        alert("Já existe um administrador no sistema. Apenas um administrador é permitido. Por favor, altere o perfil do administrador atual antes de designar um novo.");
                        return;
                    }
                }
                await updateUser(userData);
            } else {
                throw new Error("A adição de novos usuários deve ser feita através da página de cadastro.");
            }
            setIsFormOpen(false);
            if (view === 'profile' && selectedUser && 'id' in userData && selectedUser.id === userData.id) {
                // After saving, we need to refresh the selected user data
                // The fetchAllData in updateUser will handle this, but we can update local state for snappier UI
                setSelectedUser(userData);
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Não foi possível salvar o usuário.');
        }
    };

    if (view === 'profile' && selectedUser) {
        return (
            <div>
                <button onClick={handleBackToList} className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    &larr; Voltar para a equipe
                </button>
                <UserProfileView 
                    user={selectedUser} 
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    isAdmin={isGlobalAdmin}
                />
                 <TeamForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveUser}
                    userToEdit={userToEdit}
                    currentUserProfile={profile}
                />
            </div>
        );
    }
    
    return (
        <div>
            <TeamView 
                onViewProfile={handleViewProfile}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                isAdmin={isGlobalAdmin}
            />
            <TeamForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                currentUserProfile={profile}
            />
        </div>
    );
};

export default TeamManagementView;