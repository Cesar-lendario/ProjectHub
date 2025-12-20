import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { GlobalRole, PermissionAction } from '../../types';
import { PERMISSION_MODULES } from '../../constants';

const ACTIONS: PermissionAction[] = ['visualizar', 'editar'];

// Módulos que são apenas de visualização (sem funcionalidade de edição)
const VIEW_ONLY_MODULES = ['dashboard', 'reports', 'notifications'];

const PermissionSettingsView: React.FC = () => {
  const {
    rolePermissions,
    updateRolePermission,
    setBulkPermissions,
  } = useProjectContext();
  const [selectedRole, setSelectedRole] = useState<GlobalRole>(GlobalRole.Admin);
  const permissions = useMemo(() => rolePermissions[selectedRole] ?? {}, [rolePermissions, selectedRole]);

  const handleCheckboxChange = (moduleId: string, action: PermissionAction) => {
    const current = permissions[moduleId] ?? [];
    let next = current.includes(action)
      ? current.filter(item => item !== action)
      : [...current, action];

    if (next.includes('editar') && !next.includes('visualizar')) {
      next = [...next, 'visualizar'];
    }

    if (!next.includes('visualizar')) {
      next = next.filter(item => item !== 'editar');
    }

    updateRolePermission(selectedRole, moduleId, Array.from(new Set(next)));
  };

  const isChecked = (moduleId: string, action: PermissionAction) => {
    const current = permissions[moduleId] ?? [];
    return current.includes(action);
  };

  const canEdit = (moduleId: string) => {
    return !VIEW_ONLY_MODULES.includes(moduleId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Configuração de Permissões</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Defina quais módulos cada perfil pode visualizar ou editar. Marcando &ldquo;Editar&rdquo; o sistema atribui automaticamente a permissão de visualização.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <strong>Nota:</strong> Módulos como Dashboard, Relatórios e Histórico de Cobranças são apenas de visualização (não possuem funcionalidade de edição).
        </p>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-50">Permissões por Perfil</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Selecione qual perfil deseja configurar e ajuste as permissões de cada módulo.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="role-permissions-select" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Configurar permissões para:
          </label>
          <select
            id="role-permissions-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as GlobalRole)}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            {Object.values(GlobalRole).map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            onClick={() => setBulkPermissions(selectedRole, 'todos')}
          >
            Marcar tudo
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setBulkPermissions(selectedRole, 'visualizar')}
          >
            Apenas visualizar
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setBulkPermissions(selectedRole, 'nenhum')}
          >
            Limpar tudo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Módulo</th>
                {ACTIONS.map(action => (
                  <th key={action} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MODULES.map(module => (
                <tr key={module.id} className="hover:bg-slate-50 dark:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 font-medium">{module.label}</td>
                  {ACTIONS.map(action => (
                    <td key={action} className="px-4 py-3 text-center">
                      {action === 'editar' && !canEdit(module.id) ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">N/A</span>
                      ) : (
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          checked={isChecked(module.id, action)}
                          onChange={() => handleCheckboxChange(module.id, action)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PermissionSettingsView;

