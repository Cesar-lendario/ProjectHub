import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GlobalRole } from '../../types';
import Card from '../ui/Card';
import { supabase } from '../../services/supabaseClient';
import { InvitesService, type InviteRow } from '../../services/api';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<GlobalRole>(GlobalRole.Engineer);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUp } = useAuth();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteRow | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Busca TODOS os usuários para debug
        const { data: allUsers, error: allError } = await supabase
          .from('users')
          .select('id, name, role');
        
        console.log('=== DEBUG: Todos os usuários ===');
        console.log('allUsers:', allUsers);
        console.log('allError:', allError);
        
        // Busca específica por admin
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        console.log('=== DEBUG: Busca por admin ===');
        console.log('data:', data);
        console.log('error:', error);

        if (error && (error as any).code !== 'PGRST116') {
          throw error;
        }

        const adminExists = !!(data && (data as any[]).length > 0);
        console.log('=== DEBUG: Admin existe? ===', adminExists);
        setHasAdmin(adminExists);
      } catch (err) {
        console.error('Erro ao verificar administrador existente:', err);
        // Em caso de erro, assumir que já existe admin para evitar cadastros abertos
        setHasAdmin(true);
      }
    };

    checkAdmin();

    // Verificar se há um token de convite na URL
    const checkInvite = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('invite');
      
      console.log('=== DEBUG: Verificando convite ===');
      console.log('Token da URL:', token);
      
      if (token) {
        setLoading(true);
        try {
          console.log('Buscando convite no Supabase...');
          const invite = await InvitesService.getById(token);
          console.log('Resultado da busca:', invite);
          
          if (!invite) {
            console.error('Convite não encontrado');
            setError('Convite inválido ou expirado.');
            setLoading(false);
            return;
          }

          if (invite.status !== 'pending') {
            console.error('Convite não está pendente:', invite.status);
            setError('Este convite já foi utilizado ou expirou.');
            setLoading(false);
            return;
          }

          const now = new Date();
          const expiresAt = new Date(invite.expires_at);
          if (now > expiresAt) {
            console.error('Convite expirado');
            setError('Este convite expirou.');
            setLoading(false);
            return;
          }

          console.log('Convite válido! Preenchendo campos...');
          // Pré-preencher os campos
          setInviteToken(token);
          setInviteData(invite);
          setFullName(invite.name);
          setEmail(invite.email);
          setSelectedRole(invite.role === 'supervisor' ? GlobalRole.Supervisor : GlobalRole.Engineer);
          setIsLogin(false); // Forçar modo cadastro
          setLoading(false);
          console.log('Campos preenchidos com sucesso!');
        } catch (err) {
          console.error('ERRO ao validar convite:', err);
          setError('Erro ao validar convite. Tente novamente.');
          setLoading(false);
        }
      }
    };

    checkInvite();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else {
        if (!fullName) {
            throw new Error("O nome completo é obrigatório para o cadastro.");
        }
        
        // Bloquear cadastro direto se já existe admin E não é via convite
        if (hasAdmin && !inviteToken) {
          throw new Error('Novos cadastros só podem ser feitos via convite do administrador.');
        }

        const roleToUse = hasAdmin === false ? GlobalRole.Admin : selectedRole;

        const { error } = await signUp(email, password, fullName, roleToUse);
        if (error) throw error;

        // Se foi via convite, marcar como aceito
        if (inviteToken && inviteData) {
          try {
            await InvitesService.markAccepted(inviteToken);
          } catch (err) {
            console.error('Erro ao marcar convite como aceito:', err);
          }
        }

        alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  console.log('=== DEBUG: Render LoginPage ===');
  console.log('hasAdmin:', hasAdmin);
  console.log('isLogin:', isLogin);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 transition-colors">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">TaskMeet</h1>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-6">Gerenciamento Profissional de Projetos</p>
        <Card>
          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-slate-50 mb-6">
            {isLogin ? 'Acessar sua conta' : inviteToken ? 'Completar seu Cadastro' : 'Criar uma nova conta'}
          </h2>
          {inviteToken && inviteData && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                ✉️ Você foi convidado(a) para se juntar à equipe como <strong>{inviteData.role === 'supervisor' ? 'Supervisor' : 'Engenheiro'}</strong>
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome Completo</label>
                  <input
                    type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required={!isLogin}
                    disabled={!!inviteToken}
                  />
                </div>
                <div>
                  <label htmlFor="roleSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Perfil</label>
                  <select
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as GlobalRole)}
                    className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required={!isLogin}
                    disabled={!!inviteToken}
                  >
                    {Object.values(GlobalRole)
                      .filter(role => !(hasAdmin && role === GlobalRole.Admin))
                      .map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={!!inviteToken}
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (hasAdmin && isLogin) {
                  setError('Novos cadastros são feitos apenas via convite do administrador.');
                  return;
                }
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
