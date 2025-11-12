import React, { useState, useMemo } from 'react';
import { User, Task, Project } from '../../types';
import { AlertCircleIcon, TrashIcon, UserIcon } from '../ui/Icons';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="⚠️ Excluir Membro da Equipe"
      size="2xl"
    >
      <div className="p-6 space-y-6">
        {/* Alerta de Ação Irreversível */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Esta ação não pode ser desfeita
              </p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                O usuário será permanentemente removido do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-600 shadow-md"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-50">{user.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.function || 'Sem função definida'}</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 mt-2">
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
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{impactAnalysis.projectCount}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Projeto(s)</div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{impactAnalysis.taskCount}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Tarefa(s) Atribuída(s)</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{impactAnalysis.adminProjectCount}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Admin em Projeto(s)</div>
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
          <div>
            <Select
              label="Reatribuir tarefas para (opcional)"
              value={reassignUserId}
              onChange={(e) => setReassignUserId(e.target.value)}
              options={[
                { value: 'none', label: 'Deixar sem responsável' },
                ...availableUsers.map(u => ({ 
                  value: u.id, 
                  label: `${u.name} (${u.function || 'Sem função'})` 
                }))
              ]}
              disabled={isDeleting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Se não selecionar ninguém, as tarefas ficarão sem responsável e poderão ser reatribuídas depois.
            </p>
          </div>
        )}

        {/* Confirmação com Nome */}
        <div>
          <Input
            label={
              <span>
                Digite <span className="text-red-600 dark:text-red-400 font-bold">{user.name}</span> para confirmar:
              </span>
            }
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={user.name}
            disabled={isDeleting}
            className="focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Aviso Final */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>⚠️ Esta ação é irreversível.</strong> O perfil do usuário será permanentemente removido do sistema.
            A conta de autenticação não será afetada.
          </p>
        </div>

        {/* Footer com Botões */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleConfirm}
            disabled={isDeleting || confirmText !== user.name}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Excluindo...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;

