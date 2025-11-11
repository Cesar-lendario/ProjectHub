import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { User, GlobalRole } from '../../types';
import Card from '../ui/Card';
import TeamForm from '../team/TeamForm';
import { EditIcon, TrashIcon } from '../ui/Icons';

const UserManagementView: React.FC = () => {
    const { users, updateUser, deleteUser } = useProjectContext();
    const { profile } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

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

    const handleDeleteUser = async (userToDelete: User) => {
        if (profile?.id === userToDelete.id) {
            alert("Você não pode excluir seu próprio perfil.");
            return;
        }
        if (userToDelete.role === GlobalRole.Admin) {
            alert("Não é possível excluir o administrador do sistema. Para isso, promova outro usuário a administrador primeiro.");
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${userToDelete.name}? A conta de autenticação não será removida, apenas o perfil.`)) {
            try {
                await deleteUser(userToDelete.id);
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
            <Card>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
                    <p className="mt-1 text-slate-600">Gerencie os perfis e permissões de todos os usuários do sistema.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.function}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="text-indigo-600 hover:text-indigo-900 p-2"
                                            title="Editar"
                                        >
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="text-slate-500 hover:text-red-700 p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Excluir"
                                            disabled={profile?.id === user.id || user.role === GlobalRole.Admin}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
        </>
    );
};

export default UserManagementView;
