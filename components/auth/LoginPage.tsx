import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GlobalRole } from '../../types';
import Card from '../ui/Card';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<GlobalRole>(GlobalRole.Engineer);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUp } = useAuth();

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
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) throw error;
        alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-slate-800 dark:text-white mb-2">ProjectHub</h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">Gerenciamento Profissional de Projetos</p>
        <Card>
          <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-6">
            {isLogin ? 'Acessar sua conta' : 'Criar uma nova conta'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <input
                    type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label htmlFor="roleSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                  <select
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as GlobalRole)}
                    className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required={!isLogin}
                  >
                    {Object.values(GlobalRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
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
