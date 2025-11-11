# 🌙 Modo Escuro / Modo Claro

## 📋 Visão Geral

O ProjectHub agora possui suporte completo para **modo escuro** e **modo claro**, permitindo que os usuários escolham o tema que melhor se adapta às suas preferências e ambiente de trabalho.

## ✨ Funcionalidades

### 🎨 Toggle de Tema
- **Localização**: Botão no canto superior direito do header, ao lado do perfil do usuário
- **Ícones**: 
  - ☀️ Sol: Indica modo claro (clique para ativar modo escuro)
  - 🌙 Lua: Indica modo escuro (clique para ativar modo claro)
- **Persistência**: A preferência é salva no `localStorage` e mantida entre sessões

### 🔄 Transições Suaves
- Todas as mudanças de cor possuem transições suaves (`transition-colors`)
- Experiência visual agradável ao alternar entre temas

### 🎨 Paleta de Cores

#### Modo Claro
- **Background principal**: `bg-slate-50`
- **Background secundário**: `bg-slate-100`
- **Cards**: `bg-white` com borda `border-slate-100`
- **Texto principal**: `text-slate-900`
- **Texto secundário**: `text-slate-600`
- **Borders**: `border-slate-200/300`

#### Modo Escuro
- **Background principal**: `bg-slate-950`
- **Background secundário**: `bg-slate-900`
- **Cards**: `bg-slate-800` com borda `border-slate-700`
- **Texto principal**: `text-white`
- **Texto secundário**: `text-slate-300/400`
- **Borders**: `border-slate-700`

### 🔧 Cores de Acento
- **Indigo** (primário): Mantém-se consistente entre temas
  - Modo claro: `indigo-600`
  - Modo escuro: `indigo-500`
- **Badges e Status**: Adaptados automaticamente (ex: badge admin)

## 🏗️ Implementação Técnica

### Arquitetura

```
ThemeProvider (hooks/useTheme.tsx)
    ↓
App.tsx (ThemeProvider wrapper)
    ↓
Componentes (classes dark:)
```

### Hook `useTheme`

```typescript
const { theme, toggleTheme } = useTheme();

// theme: 'light' | 'dark'
// toggleTheme: () => void
```

**Funcionalidades**:
- Estado inicial: `'dark'` (padrão)
- Lê preferência do `localStorage`
- Adiciona/remove classe `dark` no `<html>`
- Salva mudanças automaticamente

### Tailwind CSS

**Configuração** (`tailwind.config.js`):
```javascript
export default {
  darkMode: 'class', // Habilita dark mode com classe
  // ...
}
```

**Como usar**:
```tsx
// Sintaxe: className="light-class dark:dark-class"
<div className="bg-white dark:bg-slate-800">
  <h1 className="text-slate-900 dark:text-white">Título</h1>
  <p className="text-slate-600 dark:text-slate-300">Parágrafo</p>
</div>
```

## 📦 Componentes Atualizados

### ✅ Componentes com Dark Mode

- ✅ `Card.tsx`: Background, borders, shadows
- ✅ `Header.tsx`: Background, texto, botões, dropdown
- ✅ `Sidebar.tsx`: Background, nav items, borders
- ✅ `App.tsx`: Background principal e loading screen
- ✅ `LoginPage.tsx`: Formulários, inputs, botões, texto

### 🔄 Padrões de Classes Dark

#### Backgrounds
```tsx
className="bg-white dark:bg-slate-800"           // Cards
className="bg-slate-50 dark:bg-slate-950"        // Páginas
className="bg-slate-100 dark:bg-slate-900"       // Backgrounds secundários
```

#### Texto
```tsx
className="text-slate-900 dark:text-white"       // Títulos
className="text-slate-700 dark:text-slate-200"   // Texto normal
className="text-slate-600 dark:text-slate-300"   // Texto secundário
className="text-slate-500 dark:text-slate-400"   // Texto terciário
```

#### Borders
```tsx
className="border-slate-200 dark:border-slate-700"   // Borders padrão
className="border-slate-300 dark:border-slate-600"   // Borders de inputs
```

#### Hovers
```tsx
className="hover:bg-slate-100 dark:hover:bg-slate-800"   // Buttons/Links
className="hover:text-slate-900 dark:hover:text-white"   // Texto hover
```

#### Shadows
```tsx
className="shadow-md dark:shadow-slate-900/50"
className="hover:shadow-lg dark:hover:shadow-slate-900/70"
```

## 🎨 Exemplos de Uso

### Botão com Dark Mode
```tsx
<button className="
  px-4 py-2 
  bg-indigo-600 dark:bg-indigo-500 
  hover:bg-indigo-700 dark:hover:bg-indigo-600
  text-white 
  rounded-lg 
  transition-colors
">
  Clique Aqui
</button>
```

### Card com Dark Mode
```tsx
<Card className="
  bg-white dark:bg-slate-800 
  border border-slate-200 dark:border-slate-700
">
  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
    Título
  </h2>
  <p className="text-slate-600 dark:text-slate-300">
    Conteúdo
  </p>
</Card>
```

### Input com Dark Mode
```tsx
<input
  type="text"
  className="
    w-full 
    px-3 py-2 
    bg-white dark:bg-slate-900 
    border border-slate-300 dark:border-slate-600
    text-slate-900 dark:text-white
    placeholder-slate-400 dark:placeholder-slate-500
    rounded-md
    focus:ring-indigo-500 focus:border-indigo-500
    transition-colors
  "
  placeholder="Digite aqui"
/>
```

## 🚀 Como Usar

### Para Usuários

1. Faça login no ProjectHub
2. Localize o botão de toggle no canto superior direito do header (ao lado do seu perfil)
3. Clique no ícone:
   - **☀️ (Sol)**: Ativa o modo claro
   - **🌙 (Lua)**: Ativa o modo escuro
4. O tema escolhido será salvo e mantido nas próximas visitas

### Para Desenvolvedores

#### Adicionar Dark Mode a um Novo Componente

1. **Importe o hook** (opcional, para lógica condicional):
```typescript
import { useTheme } from '../../hooks/useTheme';
const { theme } = useTheme();
```

2. **Adicione classes dark:** aos elementos:
```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  {/* Conteúdo */}
</div>
```

3. **Teste ambos os temas**:
   - Alterne entre claro e escuro
   - Verifique contraste e legibilidade
   - Confirme que transições estão suaves

#### Checklist de Implementação

- [ ] Backgrounds principais com `dark:bg-*`
- [ ] Texto com `dark:text-*`
- [ ] Borders com `dark:border-*`
- [ ] Hovers com `dark:hover:*`
- [ ] Shadows com `dark:shadow-*`
- [ ] Transições com `transition-colors`
- [ ] Testar em ambos os temas
- [ ] Verificar contraste (acessibilidade)

## 🎯 Próximas Melhorias

### Planejadas
- [ ] Modo automático (baseado no sistema operacional)
- [ ] Mais opções de temas (além de claro/escuro)
- [ ] Personalização de cores primárias
- [ ] Exportar/importar configurações de tema
- [ ] Preview de temas antes de aplicar

### Acessibilidade
- [ ] Verificar contraste WCAG AA/AAA
- [ ] Suporte a prefers-color-scheme
- [ ] Modo de alto contraste
- [ ] Redução de movimento (prefers-reduced-motion)

## 📱 Suporte

### Navegadores Compatíveis
- ✅ Chrome/Edge (88+)
- ✅ Firefox (87+)
- ✅ Safari (14+)
- ✅ Opera (74+)

### Dispositivos
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablets

## 🐛 Troubleshooting

### Tema não muda ao clicar
1. Limpe o cache do navegador (`Ctrl + Shift + R`)
2. Verifique o console para erros
3. Certifique-se de que JavaScript está habilitado

### Tema não persiste
1. Verifique se `localStorage` está habilitado
2. Limpe dados do site e teste novamente
3. Desabilite extensões que possam interferir

### Cores estranhas/bugs visuais
1. Limpe o cache do navegador
2. Force rebuild: `npm run build`
3. Verifique se há classes Tailwind conflitantes

## 📚 Referências

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Web.dev: prefers-color-scheme](https://web.dev/prefers-color-scheme/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Data de Implementação:** 11/11/2025  
**Versão:** 1.0  
**Status:** ✅ Funcional

