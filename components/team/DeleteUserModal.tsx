import React, { useState, useMemo } from 'react';
import { User, Task, Project } from '../../types';
import { XIcon, AlertCircleIcon, TrashIcon, UserIcon } from '../ui/Icons';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, reassignTo: string | null) => Promise<void>;
  user: User | null;
  projects: Project[];
  users: User[];
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  projects,
  users,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [reassignUserId, setReassignUserId] = useState<string>('none');
  const [confirmText, setConfirmText] = useState('');

  // Calcular impacto da exclusão
  const impactAnalysis = useMemo(() => {
    if (!user) return null;

    // Projetos onde é membro
    const userProjects = projects.filter(p =>
      p.team.some(tm => tm.user.id === user.id)
    );

    // Tarefas atribuídas
    const assignedTasks: { task: Task; project: Project }[] = [];
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignee?.id === user.id) {
          assignedTasks.push({ task, project });
        }
      });
    });

    // Projetos onde é admin
    const adminProjects = projects.filter(p =>
      p.team.some(tm => tm.user.id === user.id && tm.role === 'admin')
    );

    return {
      projectCount: userProjects.length,
      taskCount: assignedTasks.length,
      adminProjectCount: adminProjects.length,
      assignedTasks,
      userProjects,
      adminProjects,
    };
  }, [user, projects]);

  // Usuários disponíveis para reatribuição
  const availableUsers = useMemo(() => {
    return users.filter(u => u.id !== user?.id);
  }, [users, user]);

  const handleConfirm = async () => {
    if (!user) return;

    // Validar texto de confirmação
    if (confirmText !== user.name) {
      alert(`Por favor, digite "${user.name}" para confirmar a exclusão.`);
      return;
    }

    // Se houver tarefas e nenhum usuário foi selecionado
    if (impactAnalysis && impactAnalysis.taskCount > 0 && reassignUserId === 'none') {
      if (!window.confirm('As tarefas atribuídas a este usuário ficarão sem responsável. Deseja continuar?')) {
        return;
      }
    }

    setIsDeleting(true);
    try {
      await onConfirm(user.id, reassignUserId === 'none' ? null : reassignUserId);
      onClose();
      setConfirmText('');
      setReassignUserId('none');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível excluir o usuário.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !user || !impactAnalysis) return null;

  const hasImpact = impactAnalysis.projectCount > 0 || impactAnalysis.taskCount > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Excluir Membro da Equipe</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700/50 transition-colors"
            disabled={isDeleting}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-50">{user.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.function || 'Sem função definida'}</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                {user.role}
              </span>
            </div>
          </div>

          {/* Análise de Impacto */}
          {hasImpact && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircleIcon className="h-5 w-5" />
                <h3 className="font-semibold">Impacto da Exclusão</h3>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{impactAnalysis.projectCount}</div>
                  <div className="text-sm text-blue-600">Projeto(s)</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{impactAnalysis.taskCount}</div>
                  <div className="text-sm text-orange-600">Tarefa(s) Atribuída(s)</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{impactAnalysis.adminProjectCount}</div>
                  <div className="text-sm text-red-600">Admin em Projeto(s)</div>
                </div>
              </div>

              {/* Avisos Específicos */}
              <div className="space-y-2">
                {impactAnalysis.projectCount > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Atenção:</strong> Este usuário será removido de {impactAnalysis.projectCount} projeto(s).
                    </p>
                  </div>
                )}

                {impactAnalysis.taskCount > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>⚠️ Tarefas Atribuídas:</strong> {impactAnalysis.taskCount} tarefa(s) precisam de um novo responsável.
                    </p>
                  </div>
                )}

                {impactAnalysis.adminProjectCount > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>🚨 Crítico:</strong> Este usuário é administrador de {impactAnalysis.adminProjectCount} projeto(s). 
                      Considere atribuir outro administrador antes de excluir.
                    </p>
                  </div>
                )}
              </div>

              {/* Detalhes das Tarefas */}
              {impactAnalysis.taskCount > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-50 text-sm">Tarefas que serão afetadas:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200">
                    {impactAnalysis.assignedTasks.map(({ task, project }) => (
                      <div key={task.id} className="text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{task.name}</span>
                        <span className="text-slate-500 dark:text-slate-400"> — {project.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reatribuição de Tarefas */}
          {impactAnalysis.taskCount > 0 && availableUsers.length > 0 && (
            <div className="space-y-3">
              <label htmlFor="reassign-user" className="block font-semibold text-slate-800 dark:text-slate-50">
                Reatribuir tarefas para (opcional):
              </label>
              <select
                id="reassign-user"
                value={reassignUserId}
                onChange={(e) => setReassignUserId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                disabled={isDeleting}
              >
                <option value="none">Deixar sem responsável</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.function})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Se não selecionar ninguém, as tarefas ficarão sem responsável e poderão ser reatribuídas depois.
              </p>
            </div>
          )}

          {/* Confirmação com Nome */}
          <div className="space-y-3">
            <label htmlFor="confirm-name" className="block font-semibold text-slate-800 dark:text-slate-50">
              Digite <span className="text-red-600">{user.name}</span> para confirmar:
            </label>
            <input
              id="confirm-name"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user.name}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>

          {/* Aviso Final */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>⚠️ Esta ação é irreversível.</strong> O perfil do usuário será permanentemente removido do sistema.
              A conta de autenticação não será afetada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 border-t border-slate-200 bg-slate-50 dark:bg-slate-700/30">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting || confirmText !== user.name}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Excluindo...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Excluir Permanentemente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;

