import React, { useState } from 'react';
import { XIcon, EmailIcon, UserPlusIcon } from '../ui/Icons';
import { InvitesService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'supervisor' | 'engineer'>('engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('engineer');
    setError(null);
    setInviteToken(null);
    setLoading(false);
    onClose();
  };

  const handleGenerateInvite = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }

    if (!profile?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calcular data de expiração (7 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Criar convite
      const invite = await InvitesService.create({
        email: email.trim(),
        name: name.trim(),
        role: role,
        invited_by: profile.id,
        expires_at: expiresAt.toISOString(),
      });

      setInviteToken(invite.id);
    } catch (err: any) {
      console.error('Erro ao criar convite:', err);
      setError(err.message || 'Erro ao gerar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    if (!inviteToken) return '';
    return `${window.location.origin}?invite=${inviteToken}`;
  };

  const generateEmailBody = () => {
    const inviteLink = generateInviteLink();
    const roleLabel = role === 'supervisor' ? 'Supervisor' : 'Engenheiro';

    return `Olá ${name}!

Você foi convidado(a) para se juntar à equipe TaskMeet como ${roleLabel}.

Para completar seu cadastro, clique no link abaixo:
${inviteLink}

Este convite expira em 7 dias.

Atenciosamente,
Equipe TaskMeet`;
  };

  const generateEmailSubject = () => {
    return `Convite para TaskMeet - ${role === 'supervisor' ? 'Supervisor' : 'Engenheiro'}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserPlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Convidar Novo Membro
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Envie um convite por e-mail para adicionar um novo membro à equipe
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {!inviteToken ? (
            <>
              {/* Formulário de convite */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@empresa.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    O convite será enviado para este e-mail
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Perfil
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'supervisor' | 'engineer')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="engineer">Engenheiro</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Apenas Supervisores e Engenheiros podem ser convidados
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerateInvite}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Gerando...' : 'Gerar Convite'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Convite gerado - mostrar link */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                    ✅ Convite gerado com sucesso!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    O link de convite expira em 7 dias
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Link de Convite
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generateInviteLink()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateInviteLink());
                        alert('Link copiado!');
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                    📧 Envie o convite por e-mail clicando no botão abaixo:
                  </p>
                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent(generateEmailSubject())}&body=${encodeURIComponent(generateEmailBody())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all"
                  >
                    <EmailIcon className="h-4 w-4" />
                    Enviar por E-mail
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Concluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
