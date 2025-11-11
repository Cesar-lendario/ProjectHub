
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { User, GlobalRole } from '../../types';
import { XIcon } from '../ui/Icons';
import { supabase } from '../../services/supabaseClient';

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'> | User) => Promise<void>;
  userToEdit: User | null;
  currentUserProfile: User | null;
}

const TeamForm: React.FC<TeamFormProps> = ({ isOpen, onClose, onSave, userToEdit, currentUserProfile }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userFunction, setUserFunction] = useState('');
  const [role, setRole] = useState<GlobalRole>(GlobalRole.Engineer);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = currentUserProfile?.role === GlobalRole.Admin;
  const isEditing = Boolean(userToEdit);

  const resetForm = () => {
    setName('');
    setEmail('');
    setUserFunction('');
    setRole(GlobalRole.Engineer);
    const randomSeed = Math.random().toString(36).substring(7);
    const defaultAvatar = `https://i.pravatar.cc/150?u=${randomSeed}`;
    setAvatarUrl(defaultAvatar);
    setAvatarFile(null);
    setAvatarPreview(defaultAvatar);
  };

  useEffect(() => {
    if (isOpen) {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setUserFunction(userToEdit.function || '');
            setRole(userToEdit.role || GlobalRole.Engineer);
            setAvatarUrl(userToEdit.avatar);
            setAvatarPreview(userToEdit.avatar);
            setAvatarFile(null);
        } else {
            resetForm();
        }
    }
  }, [userToEdit, isOpen]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Por favor, insira o nome do membro da equipe.");
      return;
    }
    if (!isEditing && !email) {
      alert("Informe o e-mail do novo membro.");
      return;
    }

    setIsUploading(true);
    try {
        let finalAvatarUrl = avatarUrl;

        if (avatarFile) {
          const filePath = `${Date.now()}-${avatarFile.name.replace(/\s/g, '_')}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

          if (uploadError) {
            throw new Error(`Falha no upload do avatar: ${uploadError.message}. Verifique as políticas de storage no Supabase.`);
          }

          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          finalAvatarUrl = data.publicUrl;
        }

        const userData: Partial<User> = { 
          name, 
          email,
          function: userFunction,
          avatar: finalAvatarUrl,
          role
        };
        
        if (userToEdit) {
          await onSave({ ...userToEdit, ...userData });
        } else {
          await onSave(userData as Omit<User, 'id'>);
          resetForm();
        }
    } catch (error) {
        console.error("Erro ao salvar membro da equipe:", error);
        alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao salvar.");
    } finally {
        setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">{userToEdit ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
              <input
                type="text" id="user-name" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            {!isEditing && (
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  id="user-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-white text-slate-900"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">O e-mail será utilizado para autenticação futura.</p>
              </div>
            )}
            {isEditing && (
              <div>
                <label htmlFor="user-email-display" className="block text-sm font-medium text-slate-700">Email</label>
                <div className="mt-1 block w-full border border-slate-200 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-slate-50 text-slate-700">
                  {email}
                </div>
                <p className="text-xs text-slate-500 mt-1">O e-mail está vinculado à conta de login e não pode ser alterado.</p>
              </div>
            )}
            <div>
              <label htmlFor="user-function" className="block text-sm font-medium text-slate-700">Função</label>
              <input
                type="text" id="user-function" value={userFunction} onChange={(e) => setUserFunction(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ex: Desenvolvedor, Designer"
              />
            </div>
             {isAdmin && (
                <div>
                  <label htmlFor="user-role" className="block text-sm font-medium text-slate-700">Perfil</label>
                  <select
                    id="user-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as GlobalRole)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={userToEdit?.id === currentUserProfile?.id}
                  >
                    {Object.values(GlobalRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {userToEdit?.id === currentUserProfile?.id && (
                    <p className="text-xs text-slate-500 mt-1">Você não pode alterar seu próprio perfil.</p>
                  )}
                </div>
              )}
            <div>
                <label className="block text-sm font-medium text-slate-700">Avatar</label>
                <div className="mt-2 flex items-center gap-4">
                    {avatarPreview && <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />}
                    <label htmlFor="avatar-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Carregar imagem</span>
                        <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" onChange={handleAvatarChange} />
                    </label>
                </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400" disabled={isUploading}>
              {isUploading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;
