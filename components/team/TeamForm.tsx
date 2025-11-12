
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { User, GlobalRole } from '../../types';
import { supabase } from '../../services/supabaseClient';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

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
        
        // Fechar o modal após salvar com sucesso
        onClose();
    } catch (error) {
        console.error("Erro ao salvar membro da equipe:", error);
        alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao salvar.");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={userToEdit ? 'Editar Membro' : 'Adicionar Novo Membro'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Nome */}
        <Input
          label="Nome Completo"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: João Silva"
        />

        {/* Email */}
        {!isEditing ? (
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="joao@empresa.com"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              O e-mail será utilizado para autenticação futura.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              Email
            </label>
            <div className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg">
              {email}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              O e-mail está vinculado à conta de login e não pode ser alterado.
            </p>
          </div>
        )}

        {/* Função */}
        <Input
          label="Função"
          type="text"
          value={userFunction}
          onChange={(e) => setUserFunction(e.target.value)}
          placeholder="Ex: Desenvolvedor, Designer"
        />

        {/* Perfil (apenas para admins) */}
        {isAdmin && (
          <div>
            <Select
              label="Perfil"
              value={role}
              onChange={(e) => setRole(e.target.value as GlobalRole)}
              options={Object.values(GlobalRole).map(r => ({ value: r, label: r }))}
              disabled={userToEdit?.id === currentUserProfile?.id}
            />
            {userToEdit?.id === currentUserProfile?.id && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Você não pode alterar seu próprio perfil.
              </p>
            )}
          </div>
        )}

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img 
                src={avatarPreview} 
                alt="Preview" 
                className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600" 
              />
            )}
            <label 
              htmlFor="avatar-upload" 
              className="cursor-pointer bg-white dark:bg-slate-700/50 py-2.5 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
            >
              <span>📷 Carregar imagem</span>
              <input 
                id="avatar-upload" 
                name="avatar-upload" 
                type="file" 
                className="sr-only" 
                accept="image/png, image/jpeg, image/gif" 
                onChange={handleAvatarChange} 
              />
            </label>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isUploading}>
            {isUploading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamForm;
