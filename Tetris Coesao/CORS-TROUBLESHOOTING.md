# Configuração de Desenvolvimento

## Problemas de CORS Conhecidos

Se você está acessando o jogo através de um domínio diferente (como preview-chat-*.space.z.ai), pode encontrar erros de CORS. Aqui estão algumas soluções:

### Solução 1: Usar a página de teste

1. Acesse a página principal: `https://seu-dominio.space.z.ai`
2. Clique no link "Problemas de conexão? Teste aqui"
3. Na página de teste, você pode:
   - Verificar o status da conexão
   - Testar diferentes URLs do servidor
   - Ver informações de depuração

### Solução 2: Configurar o servidor corretamente

O servidor já está configurado para aceitar conexões de qualquer origem. Se você ainda tiver problemas:

1. Verifique se o servidor está rodando em `http://localhost:3000`
2. Verifique se não há firewalls bloqueando a porta 3000
3. Tente acessar diretamente `http://localhost:3000` no seu navegador

### Solução 3: Usar um proxy

Se você está em um ambiente que não permite conexões diretas para localhost, você pode:

1. Usar serviços como ngrok para expor seu localhost:
   ```bash
   ngrok http 3000
   ```
2. Atualizar a URL do servidor na página de teste para usar a URL do ngrok

### Solução 4: Deploy em produção

Para evitar completamente os problemas de CORS:

1. Faça o deploy da aplicação em um serviço como Vercel, Netlify, etc.
2. Todos os componentes (frontend e backend) estarão no mesmo domínio
3. Não haverá problemas de CORS

### URLs Comuns

- **Desenvolvimento local**: `http://localhost:3000`
- **Preview (Z.ai)**: `https://preview-chat-*.space.z.ai`
- **Produção**: URL do seu serviço de hosting

### Testando a Conexão

Use a página de teste (`/test`) para:

1. Verificar se o servidor responde a requisições HTTP
2. Testar a conexão WebSocket
3. Medir o ping/latência
4. Obter informações de depuração

### Erros Comuns e Soluções

**Erro**: "Requisição cross-origin bloqueada"
- **Causa**: O navegador está bloqueando a conexão devido a políticas de CORS
- **Solução**: Use a página de teste para diagnosticar e ajustar as configurações

**Erro**: "Failed to connect to WebSocket"
- **Causa**: O servidor não está acessível ou o WebSocket está bloqueado
- **Solução**: Verifique se o servidor está rodando e acessível

**Erro**: "Connection timeout"
- **Causa**: O servidor está demorando muito para responder
- **Solução**: Verifique a latência da rede e a configuração do servidor