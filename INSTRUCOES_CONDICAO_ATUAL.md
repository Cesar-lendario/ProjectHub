# Funcionalidade: Anotações do Projeto

## 📋 Descrição

Sistema simples e prático para registrar anotações sobre o estágio atual de cada projeto. Cada anotação é salva com data/hora e autor, criando um histórico temporal das observações.

## 🎯 Localização

O botão **"Condição Atual"** (verde esmeralda) está na página de **Tarefas**, ao lado dos botões "Lembrete de Tarefas" e "Resumo".

## ⚙️ Instalação

### 1. Executar Script SQL no Supabase

Você precisa criar a tabela `project_notes` no banco de dados do Supabase:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase_create_project_notes.sql`
4. Copie todo o conteúdo e execute no SQL Editor
5. Aguarde a confirmação de sucesso

**Ou via Supabase CLI:**
```bash
supabase db push --file supabase_create_project_notes.sql
```

### 2. Reiniciar o Servidor de Desenvolvimento

Após criar a tabela, reinicie o servidor para que o TypeScript reconheça a nova tabela:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm start
```

## 🚀 Como Usar

### 1. Acessar o Modal

1. Vá para a página de **Tarefas**
2. Clique no botão **"Condição Atual"** (verde esmeralda)
3. Selecione o projeto desejado (ou use o projeto já filtrado)

### 2. Adicionar Nova Anotação

1. Digite sua anotação no campo "Nova Anotação"
2. Clique em **"+ Adicionar Anotação"**
3. A anotação é salva instantaneamente

**O que anotar:**
- Estágio atual do projeto
- Progresso das atividades
- Problemas encontrados
- Decisões tomadas
- Próximas ações
- Observações importantes

**Exemplo:**
```text
API REST 80% concluída. Autenticação implementada.
Próximo: integração com frontend.
```

### 3. Visualizar Histórico

- Todas as anotações aparecem na seção "Histórico de Anotações"
- Cada anotação mostra:
  - **Nome do autor** (quem escreveu)
  - **Data e hora** (quando foi escrita)
  - **Texto completo** da anotação
- As anotações mais recentes aparecem primeiro
- Scroll automático para navegação no histórico

## 🔒 Permissões

### Visualização
- ✅ **Todos** os usuários autenticados podem ver as anotações

### Criação
- ✅ **Todos** os usuários autenticados podem adicionar anotações
- Cada usuário só pode adicionar em seu próprio nome

### Exclusão
- ✅ **Administradores**: podem deletar qualquer anotação
- ✅ **Próprio autor**: pode deletar suas próprias anotações

## 📊 Tabela do Banco de Dados

### Estrutura: `project_notes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (PK) |
| `project_id` | UUID | Referência ao projeto (FK) |
| `note_text` | TEXT | Texto da anotação |
| `created_at` | TIMESTAMP | Data/hora de criação |
| `created_by` | UUID | Autor da anotação (FK users) |

### Características
- **Múltiplas anotações** por projeto (histórico ilimitado)
- **CASCADE DELETE**: Deletado se o projeto for excluído
- **Ordenação**: Mais recentes primeiro

## 🎨 Interface Visual

- **Botão**: Verde esmeralda com efeito hover
- **Modal**: Design limpo e compacto
- **Botão adicionar**: Verde esmeralda, largura total
- **Histórico**: Cards com fundo claro, borda, scroll vertical
- **Data**: Formato brasileiro (dd/mm/aaaa hh:mm)
- **Layout**: Autor à esquerda, data à direita

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ `components/tasks/ProjectConditionModal.tsx` - Modal de anotações
- ✅ `supabase_create_project_notes.sql` - Script SQL da tabela
- ✅ `INSTRUCOES_CONDICAO_ATUAL.md` - Este arquivo

### Arquivos Modificados
- ✅ `components/tasks/TaskList.tsx` - Botão e integração
- ✅ `types/database.types.ts` - Tipos TypeScript

## 📝 Benefícios

1. **Simplicidade**: Interface minimalista e rápida
2. **Histórico completo**: Todas as anotações preservadas
3. **Temporal**: Data e hora de cada anotação
4. **Rastreabilidade**: Autor identificado automaticamente
5. **Colaborativo**: Toda a equipe pode anotar
6. **Cronológico**: Anotações ordenadas do mais recente

## ⚠️ Notas Importantes

- Execute o script SQL **antes** de usar
- Reinicie o servidor após criar a tabela
- Cada projeto pode ter **infinitas anotações**
- Anotações **não podem ser editadas** (apenas adicionadas ou deletadas)
- Use anotações curtas e objetivas para melhor leitura

## 🐛 Troubleshooting

### Erro: "Tabela não existe"
**Solução**: Execute `supabase_create_project_notes.sql` no Supabase

### Erro: "Erro ao salvar nota"
**Solução**: Verifique se a tabela `project_notes` foi criada

### Anotações não aparecem
**Solução**: Verifique RLS policies e permissões no Supabase

### Data em formato errado
**Solução**: Verificar timezone do navegador e servidor

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do servidor
3. Políticas RLS no Supabase
4. Permissões do usuário logado
