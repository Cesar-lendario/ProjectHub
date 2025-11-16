import React, { useMemo, useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useAuth } from '../../hooks/useAuth';
import { User, TaskStatus, TaskPriority, GlobalRole } from '../../types';
import Card from '../ui/Card';
import { TasksIcon, CheckSquareIcon, AlertCircleIcon, EditIcon, TrashIcon } from '../ui/Icons';

interface UserProfileViewProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
}

const getPriorityChip = (priority: TaskPriority) => {
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    switch (priority) {
        case TaskPriority.High: return `${baseClasses} bg-red-100 text-red-800`;
        case TaskPriority.Medium: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case TaskPriority.Low: return `${baseClasses} bg-blue-100 text-blue-800`;
    }
}

const getStatusChip = (status: TaskStatus) => {
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    switch (status) {
        case TaskStatus.Pending: return `${baseClasses} bg-purple-100 text-purple-800`;
        case TaskStatus.ToDo: return `${baseClasses} bg-slate-200 text-slate-800`;
        case TaskStatus.InProgress: return `${baseClasses} bg-orange-200 text-orange-800`;
        case TaskStatus.Done: return `${baseClasses} bg-green-200 text-green-800`;
    }
}

const StatItem: React.FC<{ icon: React.ElementType; value: number; label: string; iconClasses: string }> = ({ icon: Icon, value, label, iconClasses }) => (
    <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full ${iconClasses.split(' ')[0]}`}>
            <Icon className={`h-5 w-5 ${iconClasses.split(' ')[1]}`} />
        </div>
        <div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-50 mr-2">{value}</span>
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
        </div>
    </div>
);

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onEdit, onDelete, isAdmin }) => {
  const { projects, changeUserRole, profile, updateUser } = useProjectContext();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<GlobalRole>(user.role);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isOwnProfile = profile?.id === user.id;

  const userTasks = useMemo(() => {
    return projects.flatMap(p => 
        p.tasks
            .filter(t => t.assignee?.id === user.id)
            .map(t => ({ ...t, projectName: p.name }))
    );
  }, [projects, user.id]);

  const stats = useMemo(() => {
    const completed = userTasks.filter(t => t.status === TaskStatus.Done).length;
    const overdue = userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
    return {
        total: userTasks.length,
        completed,
        overdue,
    };
  }, [userTasks]);

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar senha.');
    }
  };

  const handleRoleChange = (role: GlobalRole) => {
    setSelectedRole(role);
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = async () => {
    setIsUploadingAvatar(true);
    try {
      // Upload do avatar se houver arquivo selecionado
      let finalAvatarUrl = user.avatar;
      if (avatarFile) {
        const { supabase } = await import('../../services/supabaseClient');
        const filePath = `${Date.now()}-${avatarFile.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw new Error(`Falha no upload do avatar: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      changeUserRole(user.id, selectedRole);
      // Salvar email e avatar editados no contexto do projeto
      await updateUser({ ...user, email: editedEmail, avatar: finalAvatarUrl });
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setHasUnsavedChanges(false);
      setIsEditingEmail(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar perfil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleEmailChange = (newEmail: string) => {
    setEditedEmail(newEmail);
    setHasUnsavedChanges(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setHasUnsavedChanges(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para a equipe
        </button>
        {isAdmin && !isOwnProfile && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(user)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-700/30"
            >
              <EditIcon className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg shadow-sm hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Card de Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16">
            <div className="flex relative group">
              <img 
                src={avatarPreview || user.avatar} 
                alt={user.name} 
                className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
              {isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full"></div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="relative z-10 cursor-pointer p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 dark:bg-slate-700/30 transition-colors"
                    title="Alterar foto"
                  >
                    <svg className="h-6 w-6 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 z-20 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Remover foto"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">{user.name}</h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-3">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === GlobalRole.Admin ? 'bg-purple-100 text-purple-800' :
                  user.role === GlobalRole.Supervisor ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="border-t border-slate-200 bg-slate-50 dark:bg-slate-700/30 grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                <TasksIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">Tarefas Atribuídas</p>
            </div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                <CheckSquareIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.completed}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">Tarefas Concluídas</p>
            </div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.overdue}</p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">Tarefas Atrasadas</p>
            </div>
          </div>
        </div>
      </Card>

      {isOwnProfile && (
        <>
          {/* Card de Informações do Perfil */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Informações do Perfil</h2>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nome Completo</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200">
                    <svg className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-900 dark:text-slate-50 font-medium">{user.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border-2 border-indigo-500 flex-1">
                        <svg className="h-5 w-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className="flex-1 text-slate-900 dark:text-slate-50 font-medium bg-transparent border-none outline-none focus:ring-0 p-0"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => setIsEditingEmail(false)}
                        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-700/50 rounded-lg"
                        title="Cancelar edição"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 flex-1">
                        <svg className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-900 dark:text-slate-50 font-medium">{editedEmail}</span>
                      </div>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar email"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Perfil/Função */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Perfil (Função)</label>
                  <div className="space-y-2">
                    {Object.values(GlobalRole).map(role => (
                      <label
                        key={role}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRole === role 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="role-option"
                            value={role}
                            checked={selectedRole === role}
                            onChange={() => handleRoleChange(role)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`text-sm font-medium ${selectedRole === role ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {role}
                          </span>
                        </div>
                        {selectedRole === role && (
                          <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Botão Salvar Perfil */}
                <div className="pt-4 border-t border-slate-200">
                  {saveSuccess && (
                    <div className="mb-3 rounded-lg bg-green-50 p-3 border border-green-200">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Perfil atualizado com sucesso!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={!hasUnsavedChanges || isUploadingAvatar}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                      hasUnsavedChanges && !isUploadingAvatar
                        ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                    }`}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {hasUnsavedChanges ? 'Salvar Alterações' : 'Nenhuma Alteração'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de Segurança - Alteração de Senha */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Segurança da Conta</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Altere sua senha para manter sua conta segura</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-2">Requisitos da senha:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mínimo de 6 caracteres
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        As senhas devem coincidir
                      </li>
                    </ul>
                  </div>

                  {passwordError && (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                      <p className="text-sm text-red-800 flex items-center gap-2">
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {passwordError}
                      </p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Senha alterada com sucesso!
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-4"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Alterar Senha
                </button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserProfileView;