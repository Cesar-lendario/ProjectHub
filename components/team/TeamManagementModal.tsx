import React, { useState, useMemo } from 'react';
import { Project, User, TeamMember } from '../../types';
import { useProjectContext } from '../../hooks/useProjectContext';
import { XIcon, PlusIcon, TrashIcon } from '../ui/Icons';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose, project }) => {
  const { users, addUserToProject, removeUserFromProject, updateTeamMemberRole } = useProjectContext();
  const [userToAdd, setUserToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Users who are not yet on the project team
  const availableUsers = useMemo(() => {
    const teamUserIds = new Set(project.team.map(tm => tm.user.id));
    return users.filter(u => !teamUserIds.has(u.id));
  }, [users, project.team]);

  const handleAddUser = async () => {
    if (!userToAdd) return;
    setIsLoading(true);
    try {
      await addUserToProject(project.id, userToAdd, 'viewer'); // Add as viewer by default
      setUserToAdd('');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to add user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro do projeto?')) {
        setIsLoading(true);
        try {
            await removeUserFromProject(project.id, userId);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to remove user.');
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleRoleChange = async (userId: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
        await updateTeamMemberRole(project.id, userId, role);
    } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : 'Failed to update role.');
    } finally {
        setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Gerenciar Equipe: {project.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add user section */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-50 mb-2">Adicionar Membro</h3>
            <div className="flex gap-2">
              <select
                value={userToAdd}
                onChange={(e) => setUserToAdd(e.target.value)}
                className="flex-grow border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um usuário</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <button onClick={handleAddUser} disabled={!userToAdd || isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                <PlusIcon className="h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* Current team section */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-50 mb-2">Membros Atuais</h3>
            <div className="space-y-3">
              {project.team.map(({ user, role }) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.function}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as TeamMember['role'])}
                      disabled={isLoading}
                      className="border border-slate-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                    <button onClick={() => handleRemoveUser(user.id)} disabled={isLoading} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </div>
              ))}
              {project.team.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhum membro na equipe deste projeto.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-slate-50 dark:bg-slate-700/30 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
