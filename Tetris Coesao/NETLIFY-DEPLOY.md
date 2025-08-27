# Deploy no Netlify

O projeto "Conectivos em Queda" está pronto para ser deployado no Netlify. Siga estas instruções:

## 🚀 Pré-requisitos

- Conta no Netlify
- Repositório GitHub com o código do projeto
- Node.js 18+

## 📦 Configuração do Projeto

O projeto já está configurado com:

1. **Next.js 15** com App Router
2. **Build otimizado** para produção
3. **Suspense Boundaries** para `useSearchParams()`
4. **Arquivo de configuração Netlify** (`netlify.toml`)
5. **Configuração do Next.js** (`next.config.ts`)

## 🛠️ Passo a Passo para Deploy

### 1. Conectar ao GitHub

1. Faça login no [Netlify](https://netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte sua conta GitHub
4. Selecione o repositório do projeto

### 2. Configurar Build Settings

O Netlify deve detectar automaticamente as configurações:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 ou superior

### 3. Variáveis de Ambiente

Não são necessárias variáveis de ambiente para o funcionamento básico, mas você pode adicionar:

- `NODE_ENV`: `production` (geralmente automático)

### 4. Configurações Avançadas

O arquivo `netlify.toml` já inclui:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## ⚠️ Limitações Importantes

### WebSocket no Netlify

O Netlify **não suporta WebSocket nativo** para funções serverless. Isso significa:

1. **Versão Demo**: Funcionará perfeitamente (`/demo`)
2. **Versão Completa**: A funcionalidade multiplayer em tempo real **não funcionará** no Netlify
3. **Alternativas**:
   - Usar serviços como Vercel (suporta WebSocket)
   - Configurar um servidor WebSocket separado
   - Usar WebSockets através de serviços terceirizados

### Soluções para WebSocket

#### Opção 1: Vercel (Recomendado)
- Vercel suporta WebSocket em Serverless Functions
- Basta fazer deploy do mesmo projeto no Vercel
- A funcionalidade completa funcionará imediatamente

#### Opção 2: Servidor WebSocket Externo
- Mantenha o servidor WebSocket rodando em outro serviço
- Atualize as URLs no frontend para apontar para o servidor externo
- Exemplo: `wss://seu-servidor-websocket.com`

#### Opção 3: Usar Pusher ou Similar
- Integrar com serviços como Pusher, Ably, ou Socket.io Cloud
- Modificar o código para usar esses serviços

## 🎮 O Que Funcionará no Netlify

### ✅ Funcionalidades Disponíveis

1. **Versão Demo Offline** (`/demo`)
   - Jogo completo com todas as mecânicas
   - Não requer conexão com servidor
   - Ideal para demonstrações

2. **Interface Estática**
   - Página principal com seleção de papel
   - Página de teste de conexão
   - Todas as páginas estáticas

3. **API Routes**
   - Health check (`/api/health`)
   - Outras APIs que não requerem WebSocket

### ❌ Funcionalidades Limitadas

1. **Multiplayer em Tempo Real**
   - Criação de salas
   - Conexão entre jogadores
   - Atualizações em tempo real

2. **Socket.IO**
   - Comunicação bidirecional
   - Eventos em tempo real
   - Sincronização de estado

## 🔄 Testar Após o Deploy

Após o deploy, teste:

1. **Página Principal**: `https://seu-site.netlify.app/`
2. **Versão Demo**: `https://seu-site.netlify.app/demo`
3. **Teste de Conexão**: `https://seu-site.netlify.app/test`

## 🚀 Deploy Alternativo (Vercel)

Para funcionalidade completa, recomendo deploy no Vercel:

1. Conecte o repositório ao Vercel
2. Use as mesmas configurações de build
3. O WebSocket funcionará automaticamente

## 📝 Notas Finais

- O projeto está **100% funcional** para deploy
- A **versão demo** funciona perfeitamente em qualquer plataforma
- Para **multiplayer real**, use Vercel ou servidor WebSocket dedicado
- O código está **otimizado e pronto para produção**

---

**Resumo**: O deploy no Netlify funcionará para a versão demo e páginas estáticas, mas para a experiência completa com multiplayer, recomendo usar o Vercel.