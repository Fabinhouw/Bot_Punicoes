# 📋 Guia de Comandos - Bot de Punições

## 🎖️ Comandos Disponíveis

### 👥 Comandos para Todos os Usuários

#### `/punições [usuário]`
Mostra a quantidade de punições de um usuário.

**Parâmetros:**
- `usuário` (opcional) - Usuário para consultar. Apenas admins podem ver de outros usuários.

**Exemplos:**
```
/punições
/punições @João (apenas admins)
```

**Resposta:**
- Quantidade de punições pendentes
- Status (pagando ou livre)
- Progresso atual (se estiver pagando)
- **Botão "💪 Pagar Punição"** (se tiver punições e não estiver pagando)

**Sistema de Pagamento:**
Ao clicar no botão "💪 Pagar Punição":
1. Bot cria canal temporário `pagamento-{usuário}`
2. Envia regras de pagamento
3. Usuário deve digitar números por extenso: **UM!**, **DOIS!**, **TRÊS!**...
4. Bot valida cada mensagem e conta o progresso
5. Ao completar, zera as punições e fecha o canal

---

#### `/ping`
Verifica a latência do bot.

**Resposta:**
- Latência da mensagem
- Latência da API do Discord

---

### 👮 Comandos Administrativos

#### `/adicionar_punição @usuário quantidade [motivo]`
Adiciona punições a um usuário (apenas administradores).

**Parâmetros:**
- `usuário` (obrigatório) - Usuário que receberá a punição
- `quantidade` (obrigatório) - Quantidade de polichinelos (1-1000)
- `motivo` (opcional) - Motivo da punição (máx. 200 caracteres)

**Exemplos:**
```
/adicionar_punição @João 50
/adicionar_punição @João 100 motivo:Desobediência
```

**Funcionalidades:**
- ✅ Adiciona punições ao total do usuário
- ✅ Cria registro no banco se usuário não existir
- ✅ Envia DM para o usuário punido
- ✅ Registra log no canal #logs
- ❌ Não permite punir a si mesmo
- ❌ Não permite punir bots

---

#### `/remover_punição @usuário quantidade [motivo]`
Remove punições de um usuário (apenas administradores).

**Parâmetros:**
- `usuário` (obrigatório) - Usuário que terá punições removidas
- `quantidade` (obrigatório) - Quantidade de polichinelos a remover (1-1000)
- `motivo` (opcional) - Motivo da remoção (máx. 200 caracteres)

**Exemplos:**
```
/remover_punição @João 25
/remover_punição @João 50 motivo:Bom comportamento
```

**Funcionalidades:**
- ✅ Remove punições do total do usuário
- ✅ Não permite valores negativos (mínimo 0)
- ✅ Envia DM para o usuário
- ✅ Registra log no canal #logs
- ⚠️ Se tentar remover mais do que o usuário tem, remove todas

---

#### `/listar_punições`
Lista todos os usuários com punições pendentes (apenas administradores).

**Exemplos:**
```
/listar_punições
```

**Resposta:**
- Lista de até 25 usuários com mais punições
- Status de cada usuário (pagando ou pendente)
- Progresso (se estiver pagando)
- Total geral de punições no servidor

---

## 🔒 Permissões

### Comandos Públicos
- `/punições` (próprias punições)
- `/ping`

### Comandos Administrativos (requerem permissão de Administrador)
- `/punições @usuário` (ver punições de outros)
- `/adicionar_punição`
- `/remover_punição`
- `/listar_punições`

---

## 📊 Sistema de Logs

Todos os comandos administrativos são registrados automaticamente no canal #logs (se configurado), incluindo:

- ✅ Usuário que executou o comando
- ✅ Usuário afetado
- ✅ Quantidade de punições
- ✅ Motivo (se fornecido)
- ✅ Timestamp da ação

---

## 💾 Banco de Dados

### Tabela: usuarios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id_discord` | TEXT | ID do usuário (chave primária) |
| `punicoes` | INT | Quantidade de punições pendentes |
| `pagando` | BOOLEAN | Se está pagando punição no momento |
| `progresso` | INT | Progresso atual do pagamento |
| `created_at` | TIMESTAMP | Data de criação do registro |
| `updated_at` | TIMESTAMP | Data da última atualização |

---

## 🚀 Como Usar

### 1. Registrar os Comandos

Após criar ou modificar comandos, execute:

```bash
npm run deploy
```

Ou:

```bash
node deploy-commands.js
```

### 2. Iniciar o Bot

```bash
npm start
```

### 3. Usar os Comandos no Discord

Digite `/` no chat e selecione o comando desejado. O Discord mostrará automaticamente os parâmetros necessários.

---

## 🎯 Fluxo de Trabalho Típico

### Adicionar Punição
1. Admin usa `/adicionar_punição @usuário 100 motivo:Atraso`
2. Bot atualiza o banco de dados
3. Usuário recebe DM com a notificação
4. Log é registrado no canal #logs
5. Admin recebe confirmação visual

### Consultar Punições
1. Usuário usa `/punições`
2. Bot busca dados no banco
3. Mostra embed com informações detalhadas

### Remover Punição
1. Admin usa `/remover_punição @usuário 50 motivo:Bom comportamento`
2. Bot atualiza o banco de dados
3. Usuário recebe DM com a notificação
4. Log é registrado no canal #logs
5. Admin recebe confirmação visual

### Listar Todas as Punições
1. Admin usa `/listar_punições`
2. Bot consulta banco de dados
3. Mostra lista ordenada por quantidade
4. Exibe status e progresso de cada usuário

---

## ⚠️ Observações Importantes

1. **Permissões**: Certifique-se de que o bot tem as permissões necessárias no servidor
2. **DMs**: Usuários com DMs desabilitadas não receberão notificações privadas
3. **Logs**: Configure o `LOGS_CHANNEL_ID` no `.env` para ativar logs no Discord
4. **Banco de Dados**: O PostgreSQL deve estar rodando para os comandos funcionarem
5. **Limites**: Quantidade máxima por comando: 1000 polichinelos

---

## 🐛 Solução de Problemas

### Comandos não aparecem
- Execute `npm run deploy` novamente
- Verifique se o bot tem permissão "Use Slash Commands"
- Aguarde alguns minutos

### Erro ao executar comando
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Veja os logs no console

### Usuário não recebe DM
- Normal se o usuário tem DMs desabilitadas
- O comando ainda funciona normalmente
- Log é registrado mesmo sem DM

---

## 💪 Sistema de Pagamento de Punições

### Como Funciona

1. **Iniciar Pagamento:**
   - Use `/punições` para ver suas punições
   - Clique no botão "💪 Pagar Punição"
   - Bot cria um canal temporário só para você

2. **Regras do Pagamento:**
   - Digite números por extenso (UM, DOIS, TRÊS...)
   - Use LETRAS MAIÚSCULAS
   - Coloque em negrito: `**UM!**`
   - Termine com ponto de exclamação (!)
   - Siga a ordem sequencial

3. **Exemplos Corretos:**
   ```
   **UM!**
   **DOIS!**
   **TRÊS!**
   **QUATRO!**
   **CINCO!**
   ```

4. **Exemplos Incorretos:**
   - `um!` - sem negrito
   - `**um!**` - minúscula
   - `**UM**` - sem !
   - `UM!` - sem negrito
   - `**1!**` - número, não extenso

5. **Durante o Pagamento:**
   - ✅ Mensagens corretas recebem reação ✅
   - ❌ Mensagens erradas recebem reação ❌
   - 📊 Progresso mostrado a cada 10
   - 💪 Mensagens motivacionais em marcos importantes
   - 📝 Erros registrados no #logs

6. **Ao Completar:**
   - 🎉 Mensagem de parabéns
   - ✅ Punições zeradas automaticamente
   - 🔒 Canal fecha em 10 segundos
   - 📊 Log de sucesso no #logs

### Números Suportados

O sistema suporta números de 1 a 20 por extenso:
- 1-10: UM, DOIS, TRÊS, QUATRO, CINCO, SEIS, SETE, OITO, NOVE, DEZ
- 11-20: ONZE, DOZE, TREZE, QUATORZE, QUINZE, DEZESSEIS, DEZESSETE, DEZOITO, DEZENOVE, VINTE

---

## 📚 Funcionalidades Implementadas

- ✅ Sistema de pagamento de punições em canal temporário
- ✅ Contagem automática de polichinelos
- ✅ Validação rigorosa de formato
- ✅ Logs detalhados de erros
- ✅ Progresso em tempo real
- ✅ Fechamento automático de canal
