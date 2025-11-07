# Bot de Punições - RP Militar 🎖️

Bot completo de administração de punições para servidor de Discord de RP militar.

Sistema automatizado de gerenciamento, aplicação e pagamento de punições através de polichinelos.

---

## ✨ Funcionalidades

### 🎯 Sistema Completo de Punições
- ✅ Adicionar/remover punições (admin)
- ✅ Consultar punições (todos)
- ✅ Listar todos com punições (admin)
- ✅ Sistema de permissões robusto

### 💪 Sistema de Pagamento Automático
- ✅ Canal temporário individual
- ✅ Validação rigorosa de formato: **UM!**, **DOIS!**, **TRÊS!**
- ✅ Contagem automática e progressiva
- ✅ Mensagens motivacionais
- ✅ Fechamento automático ao completar

### 📊 Sistema de Logs
- ✅ Logs no console
- ✅ Logs no canal #logs do Discord
- ✅ Registro de todas as ações
- ✅ Alertas de erros

### 💾 Banco de Dados PostgreSQL
- ✅ Criação automática de tabelas
- ✅ Pool de conexões otimizado
- ✅ Funções auxiliares prontas

---

## 🚀 Instalação Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
copy .env.example .env
```
Edite o `.env` com suas credenciais (Discord Token, PostgreSQL, etc.)

### 3. Registrar Comandos
```bash
npm run deploy
```

### 4. Iniciar Bot
```bash
npm start
```

**Consulte `SETUP.md` para guia completo de instalação!**

---

## 📋 Comandos Disponíveis

### Comandos Públicos
- `/punições` - Consultar suas punições
- `/ping` - Verificar latência do bot

### Comandos Administrativos
- `/adicionar_punição @usuário quantidade [motivo]` - Adicionar punições
- `/remover_punição @usuário quantidade [motivo]` - Remover punições
- `/listar_punições` - Listar todos com punições

**Consulte `COMANDOS.md` para guia completo de comandos!**

---

## 💪 Como Pagar Punições

1. Use `/punições` para ver suas punições
2. Clique no botão "💪 Pagar Punição"
3. Um canal temporário será criado para você
4. Digite os números por extenso em negrito: **UM!**, **DOIS!**, **TRÊS!**...
5. Ao completar, suas punições serão zeradas e o canal fechado

**Formato correto:** `**UM!**` `**DOIS!**` `**TRÊS!**`

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: usuarios
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id_discord` | TEXT | ID do usuário (chave primária) |
| `punicoes` | INT | Quantidade de punições pendentes |
| `pagando` | BOOLEAN | Se está pagando no momento |
| `progresso` | INT | Progresso atual do pagamento |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

## 📚 Documentação

- **`SETUP.md`** - Guia completo de instalação

---

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **discord.js v14** - Biblioteca do Discord
- **PostgreSQL** - Banco de dados
- **pg** - Driver PostgreSQL
- **dotenv** - Variáveis de ambiente

---

## 📝 Licença

ISC
