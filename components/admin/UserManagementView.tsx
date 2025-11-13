import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { User, GlobalRole } from '../../types';
import Card from '../ui/Card';
import TeamForm from '../team/TeamForm';
import DeleteUserModal from '../team/DeleteUserModal';
import { EditIcon, TrashIcon } from '../ui/Icons';
import { EditIcon, TrashIcon } from '../ui/Icons';

const UserManagementView: React.FC = () => {
    const { users, projects, updateUser, deleteUser } = useProjectContext();
    const { profile } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const isGlobalAdmin = profile?.role === GlobalRole.Admin;

    if (!isGlobalAdmin) {
        return (
            <Card>
                <p className="text-red-600 text-center">Acesso negado. Esta página é apenas para administradores.</p>
            </Card>
        )
    }

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (userId: string, reassignToUserId: string | null) => {
        try {
            await deleteUser(userId, reassignToUserId);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            // Erro já é tratado no modal
            throw error;
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
                        return; // Stop the save process
                    }
                }
                await updateUser(userData);
            } else {
                // Adding users is handled by the signup flow, not here.
                throw new Error("A adição de novos usuários deve ser feita através da página de cadastro.");
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Não foi possível salvar o usuário.');
        }
    };

    return (
        <>
            <Card className="bg-slate-900/70 border border-slate-700/40 shadow-lg shadow-indigo-900/20 backdrop-blur-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-50">Gerenciamento de Usuários</h1>
                    <p className="mt-1 text-slate-400 text-sm">Gerencie os perfis e permissões de todos os usuários do sistema.</p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800/40">
                    <table className="min-w-full divide-y divide-slate-800/50">
                        <thead className="bg-slate-900/60">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Função</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Perfil</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/30 divide-y divide-slate-800/40">
                            {users.map(user => {
                                const displayUser = user.id === profile?.id ? profile : user;
                                return (
                                    <tr key={user.id} className="hover:bg-slate-800/70 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <img className="h-10 w-10 rounded-full ring-2 ring-slate-800/60" src={displayUser?.avatar || user.avatar} alt={displayUser?.name || user.name} />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-100">{displayUser?.name || user.name}</div>
                                                    <p className="text-xs text-slate-400 capitalize">{displayUser?.role || user.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{displayUser?.email || user.email || 'sem-email@sistema.com'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{displayUser?.function || user.function || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-semibold capitalize">{displayUser?.role || user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button 
                                                onClick={() => handleEditUser(displayUser || user)}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-colors"
                                                title="Editar"
                                            >
                                                <EditIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-red-400 hover:text-white hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-2"
                                                title="Excluir"
                                                disabled={profile?.id === user.id || user.role === GlobalRole.Admin}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
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
        </>
    );
};

export default UserManagementView;
