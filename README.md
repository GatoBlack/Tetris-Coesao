# Conectivos em Queda

Um jogo educacional no estilo Tetris/Arkanoid para ensinar conectivos gramaticais de forma divertida e interativa.

## 🎮 Sobre o Jogo

Conectivos em Queda é um jogo onde os alunos precisam escolher o conectivo correto para completar frases enquanto blocos descem na tela. O jogo combina aprendizado de português com mecânicas de jogos arcade, tornando o estudo mais envolvente.

### 🎯 Objetivo Educacional

- Ensinar conectivos gramaticais: adição, alternância, adversidade, sequência e causa/efeito
- Desenvolver rapidez no raciocínio linguístico
- Aprender através de jogo e competição saudável

## 🚀 Como Usar

### 🌐 Acessando o Jogo

O jogo está disponível em três versões:

1. **Versão Completa** (`/`) - Requer conexão com servidor WebSocket
2. **Versão Demo/Offline** (`/demo`) - Funciona sem conexão, ideal para testes
3. **Teste de Conexão** (`/test`) - Para diagnosticar problemas de conexão

### Para Professores (Host)

1. Acesse a página principal e selecione "Professor"
2. Digite seu nome e clique em "Criar Sala"
3. Compartilhe o código da sala com os alunos
4. Aguarde os alunos entrarem
5. Clique em "Iniciar Jogo" para começar
6. Acompanhe o progresso dos alunos em tempo real
7. Avance as rodadas manualmente ou encerre o jogo quando desejar

### Para Alunos (Jogadores)

1. Acesse a página principal e selecione "Aluno"
2. Digite o código da sala fornecido pelo professor
3. Digite seu nome e clique em "Entrar na Sala"
4. Aguarde o professor iniciar o jogo
5. Quando a rodada começar, escolha o conectivo correto antes que o bloco caia!
6. Acerte para ganhar pontos e manter suas vidas

### 🔄 Versão Demo (Offline)

Se você está tendo problemas de conexão ou quer testar o jogo:

1. Acesse `/demo` na barra de endereços
2. Selecione "Aluno" para jogar a versão demo
3. Digite qualquer código e nome para começar
4. Jogue com perguntas pré-definidas sem necessidade de servidor

## 🔧 Resolução de Problemas

### Problemas de Conexão (CORS)

Se você está acessando de um domínio diferente e encontra erros de CORS:

1. **Use a página de teste**: Acesse `/test` para diagnosticar problemas
2. **Tente a versão demo**: Acesse `/demo` para jogar offline
3. **Verifique o servidor**: Certifique-se de que o servidor está rodando em `http://localhost:3000`
4. **Configuração de CORS**: O servidor já está configurado para aceitar conexões de qualquer origem

### Soluções Rápidas

- **Para testes imediatos**: Use a versão demo em `/demo`
- **Para diagnosticar conexão**: Use a página de teste em `/test`
- **Para experiência completa**: Use a versão principal com servidor local

## 🎲 Mecânicas do Jogo

### Sistema de Pontuação

- **Base**: 100 pontos por resposta correta
- **Bônus de velocidade**: Até 50 pontos extras por respostas rápidas
- **Combo**: Até 30 pontos extras por acertos consecutivos
- **Vidas**: Cada jogador começa com 3 vidas
- **Perda de vida**: Errar uma resposta ou deixar o tempo esgotar

### Categorias de Conectivos

- **Adição**: além disso, bem como, não só... como também, também, ademais
- **Alternância**: ou, quer... quer, ora... ora, já... já, seja... seja
- **Adversidade**: mas, porém, contudo, todavia, entretanto
- **Sequência**: depois, em seguida, então, por fim, posteriormente
- **Causa**: porque, pois, portanto, logo, por isso

### Efeitos Especiais

- **Partículas**: Efeitos visuais quando acerta uma resposta
- **Sons**: Feedback sonoro para acertos, erros, game over e timer
- **Animação**: Blocos que descem com velocidade progressiva
- **Timer**: Contagem regressiva de 12 segundos por rodada

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Socket.IO, WebSocket
- **Banco de Dados**: Em memória (para simplificar o desenvolvimento)
- **Áudio**: Web Audio API para efeitos sonoros
- **Gráficos**: Canvas API para animações

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx                 # Página principal com seleção de papel
│   ├── host/
│   │   └── page.tsx            # Painel do professor
│   ├── player/
│   │   └── page.tsx            # Interface do jogo para alunos
│   ├── test/
│   │   └── page.tsx            # Página de diagnóstico de conexão
│   └── demo/
│       └── page.tsx            # Versão offline/demo
├── hooks/
│   ├── use-sound-effects.ts    # Hook para efeitos sonoros
│   ├── use-server-url.ts       # Hook para detecção de URL do servidor
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── socket.ts               # Lógica do servidor WebSocket
│   ├── db.ts
│   └── utils.ts
└── components/ui/               # Componentes reutilizáveis
```

## 🎮 Como Jogar

1. **Criando uma Sala**: O professor cria uma sala e recebe um código de 6 letras
2. **Entrando na Sala**: Alunos usam o código para entrar no jogo
3. **Iniciando o Jogo**: Professor inicia quando todos estiverem prontos
4. **Jogando**: Frases com lacunas descem na tela, alunos devem escolher o conectivo correto
5. **Pontuação**: Acertos consecutivos aumentam o combo e a velocidade
6. **Vidas**: 3 vidas por jogador, perde uma ao errar ou deixar o tempo acabar
7. **Vitória**: O jogador com mais pontos no final vence!

## 🔧 Configuração e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
```

### Execução Local

```bash
npm run dev
```

O jogo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

## 🚀 Deploy

### Netlify (Versão Demo)

O projeto está pronto para deploy no Netlify:

1. **Build funciona**: ✅ O erro do `useSearchParams()` foi corrigido
2. **Versão demo**: ✅ Funciona perfeitamente offline
3. **Limitações**: ❌ WebSocket não funciona no Netlify

Para instruções detalhadas, veja `NETLIFY-DEPLOY.md`

### Vercel (Versão Completa)

Para funcionalidade completa com WebSocket:

1. Conecte o repositório ao Vercel
2. Use as mesmas configurações de build
3. O WebSocket funcionará automaticamente

### Outras Plataformas

- **Railway**: Funciona com WebSocket
- **Render**: Funciona com WebSocket
- **Digital Ocean**: Funciona com WebSocket

## 🎨 Personalização

### Adicionando Novas Frases

As frases podem ser adicionadas no arquivo `src/lib/socket.ts` no array `SAMPLE_PHRASES`:

```typescript
const SAMPLE_PHRASES = [
  { text: 'Sua frase com __ aqui.', category: 'causa', correct: 'logo' },
  // ... mais frases
];
```

### Customizando Conectivos

Os conectivos por categoria podem ser modificados no objeto `CONNECTIVES`:

```typescript
const CONNECTIVES = {
  adicao: ['além disso', 'bem como', /* ... */],
  // ... outras categorias
};
```

## 🎯 Recursos Futuros

- [ ] Mais categorias de conectivos
- [ ] Níveis de dificuldade
- [ ] Modo de prática individual
- [ ] Ranking persistente
- [ ] Relatórios de desempenho
- [ ] Multi-salas simultâneas
- [ ] Temas visuais customizáveis

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request para melhorias.

---

**Divirta-se aprendendo com Conectivos em Queda!** 🎮📚

### 📞 Suporte

Se você encontrar problemas:

1. **Versão Demo**: Use `/demo` para jogar offline
2. **Teste de Conexão**: Use `/test` para diagnosticar problemas
3. **Documentação**: Veja `CORS-TROUBLESHOOTING.md` para soluções detalhadas