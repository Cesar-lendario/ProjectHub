import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import { useProjectContext } from '../../hooks/useProjectContext';
import { GlobalRole, PermissionAction } from '../../types';
import { PERMISSION_MODULES } from '../../constants';

const ACTIONS: PermissionAction[] = ['visualizar', 'editar'];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuração de Permissões</h1>
        <p className="mt-1 text-slate-600">
          Defina quais módulos cada perfil pode visualizar ou editar. Marcando &ldquo;Editar&rdquo; o sistema atribui automaticamente a permissão de visualização.
        </p>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Permissões por Perfil</h2>
          <p className="text-sm text-slate-600 mt-1">
            Selecione qual perfil deseja configurar e ajuste as permissões de cada módulo.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="role-permissions-select" className="text-sm font-medium text-slate-700">
            Configurar permissões para:
          </label>
          <select
            id="role-permissions-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as GlobalRole)}
            className="border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
            onClick={() => setBulkPermissions(selectedRole, 'visualizar')}
          >
            Apenas visualizar
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
            onClick={() => setBulkPermissions(selectedRole, 'nenhum')}
          >
            Limpar tudo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Módulo</th>
                {ACTIONS.map(action => (
                  <th key={action} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 capitalize">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MODULES.map(module => (
                <tr key={module.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{module.label}</td>
                  {ACTIONS.map(action => (
                    <td key={action} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        checked={isChecked(module.id, action)}
                        onChange={() => handleCheckboxChange(module.id, action)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm">
        <p>
          Todas as alterações são aplicadas imediatamente. Se futuramente conectarmos a um backend, basta
          persistir o objeto <code>rolePermissions</code> retornado pelo contexto.
        </p>
      </Card>
    </div>
  );
};

export default PermissionSettingsView;

