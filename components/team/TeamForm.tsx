import React, { useState, useEffect, FormEvent } from 'react';
import { User } from '../../types';
import { XIcon } from '../ui/Icons';

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'> | User) => void;
  userToEdit: User | null;
}

const TeamForm: React.FC<TeamFormProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setAvatar(userToEdit.avatar);
    } else {
      setName('');
      // Fornece um avatar padrão do pravatar para novos usuários
      const randomSeed = Math.random().toString(36).substring(7);
      setAvatar(`https://i.pravatar.cc/150?u=${randomSeed}`);
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Por favor, insira o nome do membro da equipe.");
      return;
    }

    const userData = { name, avatar };

    if (userToEdit) {
      onSave({ ...userData, id: userToEdit.id });
    } else {
      onSave(userData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">{userToEdit ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
              <input
                type="text"
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="user-avatar" className="block text-sm font-medium text-slate-700">URL do Avatar</label>
              <input
                type="url"
                id="user-avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
              />
              {avatar && <img src={avatar} alt="Preview" className="mt-3 w-24 h-24 rounded-full object-cover mx-auto" />}
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <button type="submit" className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;