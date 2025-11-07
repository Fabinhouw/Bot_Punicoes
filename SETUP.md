# 🚀 Guia de Instalação - Bot de Punições

## 📋 Pré-requisitos

1. **Node.js** (versão 16.9.0 ou superior)
   - Download: https://nodejs.org/

2. **PostgreSQL** (versão 12 ou superior)
   - Download: https://www.postgresql.org/download/

3. **Conta Discord Developer**
   - Portal: https://discord.com/developers/applications

## 🔧 Configuração Passo a Passo

### 1. Criar o Bot no Discord

1. Acesse https://discord.com/developers/applications
2. Clique em "New Application"
3. Dê um nome ao bot (ex: "Bot Punições RP")
4. Vá em "Bot" no menu lateral
5. Clique em "Add Bot"
6. Em "Privileged Gateway Intents", ative:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
7. Copie o **Token** (você vai precisar dele)

### 2. Obter IDs Necessários

**Client ID:**
- Na página da aplicação, vá em "General Information"
- Copie o "Application ID"

**Guild ID (ID do Servidor):**
- No Discord, ative o "Modo Desenvolvedor" (Configurações > Avançado > Modo Desenvolvedor)
- Clique com botão direito no seu servidor
- Clique em "Copiar ID"

**Logs Channel ID (Opcional):**
- Clique com botão direito no canal #logs
- Clique em "Copiar ID"

### 3. Adicionar o Bot ao Servidor

1. No Discord Developer Portal, vá em "OAuth2" > "URL Generator"
2. Selecione os scopes:
   - ✅ bot
   - ✅ applications.commands
3. Selecione as permissões:
   - ✅ Manage Channels (para criar canais temporários)
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Manage Messages
   - ✅ Use Slash Commands
4. Copie a URL gerada e abra no navegador
5. Selecione seu servidor e autorize

### 4. Configurar PostgreSQL

1. Abra o PostgreSQL (pgAdmin ou terminal)
2. Crie um banco de dados:
```sql
CREATE DATABASE bot_punicao;
```

3. Anote as credenciais:
   - Host (geralmente `localhost`)
   - Porta (geralmente `5432`)
   - Usuário (geralmente `postgres`)
   - Senha (a que você definiu na instalação)

### 5. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 6. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
copy .env.example .env
```

2. Edite o arquivo `.env` com suas informações:

```env
DISCORD_TOKEN=seu_token_do_bot_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=id_do_seu_servidor_aqui
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
DB_NAME=bot_punicao
LOGS_CHANNEL_ID=id_do_canal_logs (opcional)
```

### 7. Registrar Comandos Slash

Execute o script de deploy de comandos:

```bash
node deploy-commands.js
```

Você deve ver uma mensagem de sucesso com os comandos registrados.

### 8. Iniciar o Bot

```bash
npm start
```

Se tudo estiver correto, você verá:

```
✅ Bot de punições iniciado com sucesso
```

## ✅ Verificação

1. No Discord, digite `/` e você deve ver os comandos do bot
2. Teste o comando `/ping` para verificar se está funcionando
3. Verifique o canal #logs (se configurado) para ver os logs do bot

## 🐛 Problemas Comuns

### "Erro ao fazer login no Discord"
- Verifique se o token está correto no `.env`
- Certifique-se de que não há espaços extras

### "Erro ao conectar com PostgreSQL"
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão com pgAdmin

### "Comandos não aparecem no Discord"
- Execute `node deploy-commands.js` novamente
- Aguarde alguns minutos (comandos de servidor são instantâneos, globais levam até 1h)
- Verifique se o bot tem permissão de "Use Slash Commands"

### "Bot está offline"
- Verifique se o processo está rodando
- Veja os logs no console para identificar erros
- Confirme que todas as intents necessárias estão ativadas

## 📚 Próximos Passos

Após a instalação bem-sucedida, você pode:
- Desenvolver novos comandos na pasta `commands/`
- Adicionar novos eventos na pasta `events/`
- Implementar o sistema de pagamento de punições (Parte 2)

## 🆘 Suporte

Se encontrar problemas, verifique:
1. Logs no console
2. Logs no canal #logs do Discord
3. Documentação do discord.js: https://discord.js.org/
