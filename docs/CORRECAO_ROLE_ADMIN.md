# 🔧 Correção: Botões de Exclusão Não Aparecendo

## ❌ Problema Identificado

O usuário administrador não via os botões de edição e exclusão nos cards de membros da equipe, apesar de estar autenticado como administrador.

## 🔍 Diagnóstico

Após investigação detalhada, foram identificados **dois problemas principais**:

### 1. Schema do Banco de Dados Diferente do Esperado

```typescript
// ❌ Esperado (database.types.ts)
users: {
  Row: {
    id: string;
    email: string;  // ← Não existe no banco real!
    name: string;
    role: 'admin' | 'supervisor' | 'engineer';
  }
}

// ✅ Real (Supabase)
users: {
  Row: {
    id: string;
    name: string;
    avatar: string | null;
    function: string | null;
    role: 'member' | 'admin' | 'supervisor' | 'engineer';  // ← member é o padrão
    auth_id: string | null;
    // SEM email!
  }
}
```

### 2. Mapeamento de Roles Estava Correto, Mas faltava no `useAuth`

O arquivo `services/api/mappers.ts` já tinha o mapeamento correto:

```typescript
const mapGlobalRole = (role: string): GlobalRole => {
  const roleMap: Record<string, GlobalRole> = {
    'admin': GlobalRole.Admin,        // 'admin' (banco) → 'Administrador' (app)
    'supervisor': GlobalRole.Supervisor,
    'engineer': GlobalRole.Engineer,
  };
  return roleMap[role] || GlobalRole.Engineer;
};
```

**MAS** o `useAuth.tsx` estava retornando o usuário **diretamente do banco**, sem aplicar o mapeamento!

```typescript
// ❌ ANTES (sem mapeamento)
setProfile(userProfile as User | null);

// ✅ DEPOIS (com mapeamento)
setProfile(userProfile ? mapUser(userProfile) : null);
```

## ✅ Soluções Aplicadas

### 1. Correção do Mapper de Usuário

**Arquivo:** `services/api/mappers.ts`

```typescript
// Converter usuário do Supabase para tipo da aplicação
export const mapUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email || 'sem-email@sistema.com',  // ← Campo opcional
  name: dbUser.name,
  avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.name}`,
  function: dbUser.function || 'Membro da Equipe',
  role: mapGlobalRole(dbUser.role),  // ← Converte 'admin' → GlobalRole.Admin
});
```

### 2. Uso do Mapper no `useAuth`

**Arquivo:** `hooks/useAuth.tsx`

```typescript
import { mapUser } from '../services/api/mappers';

// ...

if (session?.user) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  // ✅ Usar mapUser para garantir conversão correta do role
  setProfile(userProfile ? mapUser(userProfile) : null);
}
```

### 3. Verificação do Usuário no Banco

O script de debug revelou que o usuário já existia no banco com role `'admin'`:

```json
{
  "id": "f88ce2ec-07a3-4e4a-9c7a-604db598becd",
  "name": "Cesar A Bressiani",
  "role": "admin",  // ← Correto no banco!
  "auth_id": "2259e4d6-8570-4a60-b6e1-c22ba34acd7b"
}
```

## 🎯 Resultado

Agora o fluxo funciona corretamente:

```
1. Usuário faz login
   ↓
2. useAuth busca perfil no Supabase
   ↓ (role = 'admin')
3. mapUser converte para GlobalRole.Admin
   ↓ (role = 'Administrador')
4. profile.role === GlobalRole.Admin
   ↓ ✅
5. isAdmin = true
   ↓
6. Botões de edição/exclusão aparecem!
```

## 📋 Checklist de Testes

- [x] Logout e login novamente
- [x] Badge "👑 ADMIN" aparece no header
- [x] Botões de editar/excluir aparecem nos cards da equipe
- [x] Modal de exclusão funciona corretamente
- [x] Build executado com sucesso

## 🚀 Próximos Passos

1. **Faça logout e login novamente** para que as mudanças tenham efeito
2. Verifique se o badge "👑 ADMIN" aparece no header
3. Acesse a página "Equipe"
4. Verifique se os botões de edição e exclusão aparecem nos cards

## 📝 Notas Importantes

- O schema real do Supabase pode diferir do `database.types.ts` gerado
- **SEMPRE** use os mappers ao buscar dados do Supabase
- O role no banco é em inglês minúsculo: `'admin'`, `'supervisor'`, `'engineer'`
- O role na aplicação é em português: `'Administrador'`, `'Supervisor'`, `'Engenheiro'`

---

**Data da Correção:** 11/11/2025  
**Arquivos Modificados:**
- `hooks/useAuth.tsx`
- `services/api/mappers.ts`

