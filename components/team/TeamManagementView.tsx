import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { User, GlobalRole } from '../../types';
import TeamView from './TeamView';
import UserProfileView from './UserProfileView';
import TeamForm from './TeamForm';
import DeleteUserModal from './DeleteUserModal';

const TeamManagementView: React.FC = () => {
    const { users, projects, addUser, updateUser, deleteUser, focusedUserId, setFocusedUserId } = useProjectContext();
    const { profile } = useAuth();
    const [view, setView] = useState<'list' | 'profile'>('list');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const isGlobalAdmin = profile?.role === GlobalRole.Admin;

    const handleViewProfile = (user: User) => {
        setSelectedUser(user);
        setView('profile');
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        setView('list');
        setFocusedUserId(null);
    };

    const handleNewUser = () => {
        setUserToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setUserToDelete(user);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async (userId: string, reassignToUserId: string | null) => {
        try {
            await deleteUser(userId, reassignToUserId);
            if (selectedUser?.id === userId) {
                handleBackToList();
            }
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            // Erro já é tratado no modal
            throw error;
        }
    };
    
    const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
        try {
            const desiredRole = 'id' in userData ? userData.role : userData.role ?? GlobalRole.Engineer;
            if (desiredRole === GlobalRole.Admin) {
                const otherAdmin = users.find(u => u.role === GlobalRole.Admin && (!('id' in userData) || u.id !== userData.id));
                if (otherAdmin) {
                    alert("Já existe um administrador no sistema. Apenas um administrador é permitido. Por favor, altere o perfil do administrador atual antes de designar um novo.");
                    return;
                }
            }

            if ('id' in userData) {
                // Rule: Only one admin allowed
                await updateUser(userData);
            } else {
                await addUser({ ...userData, role: desiredRole });
            }
            setIsFormOpen(false);
            setUserToEdit(null);
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

    useEffect(() => {
        if (focusedUserId) {
            const user = users.find(u => u.id === focusedUserId);
            if (user) {
                setSelectedUser(user);
                setUserToEdit(user);
                setView('profile');
            }
            setFocusedUserId(null);
        }
    }, [focusedUserId, users, setFocusedUserId]);

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
                onAddUser={handleNewUser}
                isAdmin={isGlobalAdmin}
            />
            <TeamForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                currentUserProfile={profile}
            />
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                user={userToDelete}
                projects={projects}
                users={users}
            />
        </div>
    );
};

export default TeamManagementView;