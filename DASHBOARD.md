# 🌐 Dashboard Web - Bot de Punições

## 📊 Visão Geral

Painel web completo para visualização e monitoramento do sistema de punições em tempo real.

---

## ✨ Funcionalidades

### **1. Estatísticas em Tempo Real**
- 👥 Total de soldados em débito
- 💪 Total de polichinelos pendentes
- 🔄 Usuários pagando agora
- ⏸️ Usuários aguardando pagamento
- 📝 Total de logs do dia

### **2. Lista de Usuários**
- Ranking completo com medalhas (🥇🥈🥉)
- ID do Discord de cada usuário
- Quantidade de punições pendentes
- Status (Pagando/Pendente)
- Progresso atual
- Última atualização

### **3. Pagamentos em Andamento**
- Cards visuais para cada pagamento
- Barra de progresso animada
- Porcentagem concluída
- Tempo desde última atualização
- Atualização automática

### **4. Sistema de Logs**
- Últimos 100 logs do sistema
- Filtro por nível (info, success, warning, error)
- Timestamp de cada log
- Descrição detalhada
- Usuário relacionado (quando aplicável)
- Cores por tipo de log

---

## 🚀 Como Usar

### **1. Instalar Dependências**

```bash
npm install
```

Isso instalará:
- `express` - Servidor web
- `cors` - Permitir requisições cross-origin
- `concurrently` - Executar bot e dashboard juntos

### **2. Configurar Porta (Opcional)**

No arquivo `.env`:
```env
DASHBOARD_PORT=3000
```

### **3. Iniciar o Dashboard**

**Opção 1: Apenas o Dashboard**
```bash
npm run dashboard
```

**Opção 2: Bot + Dashboard Juntos**
```bash
npm run start:all
```

### **4. Acessar o Dashboard**

Abra seu navegador em:
```
http://localhost:3000
```

---

## 📡 API Endpoints

O dashboard consome uma API REST com os seguintes endpoints:

### **GET /api/stats**
Retorna estatísticas gerais do sistema.

**Resposta:**
```json
{
  "totalUsuarios": 5,
  "totalPunicoes": 225,
  "usuariosPagando": 2,
  "usuariosPendentes": 3,
  "logsHoje": 45
}
```

---

### **GET /api/usuarios**
Lista todos os usuários com punições pendentes.

**Resposta:**
```json
[
  {
    "id_discord": "123456789",
    "punicoes": 100,
    "pagando": true,
    "progresso": 50,
    "created_at": "2025-11-05T20:00:00Z",
    "updated_at": "2025-11-05T20:30:00Z"
  }
]
```

---

### **GET /api/usuarios/pagando**
Lista apenas usuários que estão pagando punições no momento.

**Resposta:**
```json
[
  {
    "id_discord": "123456789",
    "punicoes": 100,
    "progresso": 50,
    "updated_at": "2025-11-05T20:30:00Z"
  }
]
```

---

### **GET /api/logs**
Retorna os últimos logs do sistema.

**Parâmetros de Query:**
- `limit` - Quantidade de logs (padrão: 50, máx: 100)
- `tipo` - Filtrar por tipo de log
- `nivel` - Filtrar por nível (info, success, warning, error)

**Exemplo:**
```
GET /api/logs?limit=20&nivel=error
```

**Resposta:**
```json
[
  {
    "id": 1,
    "tipo": "⚠️",
    "titulo": "⚠️ Formato Incorreto",
    "descricao": "Usuário: João#1234\nMensagem: um!\nErro: Sem maiúsculas",
    "usuario_id": "123456789",
    "usuario_tag": "João#1234",
    "nivel": "warning",
    "created_at": "2025-11-05T20:30:00Z"
  }
]
```

---

### **GET /api/logs/stats**
Estatísticas dos logs (por tipo, nível e dia).

**Resposta:**
```json
{
  "porTipo": [
    { "tipo": "➕", "total": 25 },
    { "tipo": "⚠️", "total": 15 }
  ],
  "porNivel": [
    { "nivel": "info", "total": 30 },
    { "nivel": "warning", "total": 15 }
  ],
  "porDia": [
    { "dia": "2025-11-05", "total": 45 }
  ]
}
```

---

### **GET /api/usuario/:id**
Detalhes de um usuário específico e seus logs.

**Exemplo:**
```
GET /api/usuario/123456789
```

**Resposta:**
```json
{
  "usuario": {
    "id_discord": "123456789",
    "punicoes": 100,
    "pagando": true,
    "progresso": 50,
    "created_at": "2025-11-05T20:00:00Z",
    "updated_at": "2025-11-05T20:30:00Z"
  },
  "logs": [
    {
      "id": 1,
      "tipo": "🏗️",
      "titulo": "🏗️ Canal Temporário Criado",
      "descricao": "Canal: pagamento-joao",
      "nivel": "info",
      "created_at": "2025-11-05T20:00:00Z"
    }
  ]
}
```

---

## 🎨 Interface do Dashboard

### **Cabeçalho**
```
🎖️ DASHBOARD - BOT DE PUNIÇÕES
Sistema de Gerenciamento RP Militar
                                    05/11/2025 20:30:45
```

### **Cards de Estatísticas**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  👥         │  │  💪         │  │  🔄         │
│  5          │  │  225        │  │  2          │
│  Soldados   │  │  Polichinelos│  │  Pagando    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### **Tabs**
```
[👥 Usuários] [🔄 Pagamentos] [📝 Logs]
```

### **Tabela de Usuários**
```
Pos | ID do Usuário | Punições | Status    | Progresso | Atualização
--------------------------------------------------------------------
🥇  | 123456789     | 100      | 🔄 Pagando| 50/100    | 5min atrás
🥈  | 987654321     | 75       | ⏸️ Pendente| -         | 1h atrás
🥉  | 555666777     | 50       | ⏸️ Pendente| -         | 2h atrás
```

### **Cards de Pagamento**
```
┌──────────────────────────────┐
│ 👤 João#1234                 │
│ Total: 100 polichinelo(s)    │
│ Progresso: 50/100            │
│ Última atualização: 5min     │
│                              │
│ Progresso          50%       │
│ ██████████░░░░░░░░░░         │
└──────────────────────────────┘
```

### **Logs**
```
┌────────────────────────────────────────┐
│ 🏗️ Canal Temporário Criado            │
│ 05/11/2025 20:00:00                    │
│                                        │
│ Usuário: João#1234 (123456789)        │
│ Canal: pagamento-joao (987654321)     │
│ Punições a Pagar: 100                  │
└────────────────────────────────────────┘
```

---

## 🔄 Atualização Automática

O dashboard atualiza automaticamente:
- **Estatísticas:** A cada 10 segundos
- **Tabelas:** A cada 10 segundos
- **Relógio:** A cada 1 segundo

Você também pode atualizar manualmente clicando no botão "🔄 Atualizar" em cada seção.

---

## 🎨 Design

### **Cores**
- **Primária:** #2c3e50 (Azul escuro)
- **Secundária:** #34495e (Cinza escuro)
- **Accent:** #3498db (Azul)
- **Success:** #2ecc71 (Verde)
- **Warning:** #f39c12 (Laranja)
- **Danger:** #e74c3c (Vermelho)

### **Gradientes**
- **Background:** Linear gradient roxo/azul
- **Cards de Pagamento:** Gradient roxo
- **Barra de Progresso:** Gradient verde/azul

### **Responsivo**
- ✅ Desktop (1400px+)
- ✅ Tablet (768px - 1399px)
- ✅ Mobile (< 768px)

---

## 📊 Estrutura do Banco de Dados

### **Tabela: logs**

```sql
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    usuario_id TEXT,
    usuario_tag TEXT,
    nivel TEXT DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_tipo ON logs(tipo);
```

**Campos:**
- `id` - ID único do log
- `tipo` - Tipo do log (emoji/palavra inicial)
- `titulo` - Título do log
- `descricao` - Descrição detalhada
- `usuario_id` - ID do Discord do usuário (opcional)
- `usuario_tag` - Tag do usuário (opcional)
- `nivel` - Nível do log (info, success, warning, error)
- `created_at` - Data/hora de criação

---

## 🔧 Tecnologias Utilizadas

### **Backend:**
- **Express.js** - Framework web
- **Node.js** - Runtime JavaScript
- **PostgreSQL** - Banco de dados
- **pg** - Cliente PostgreSQL

### **Frontend:**
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript (Vanilla)** - Lógica
- **Fetch API** - Requisições HTTP

---

## 📁 Estrutura de Arquivos

```
dashboard/
├── server.js              # Servidor Express
└── public/
    ├── index.html         # Página principal
    ├── styles.css         # Estilos
    └── script.js          # Lógica do frontend
```

---

## 🚨 Solução de Problemas

### **Dashboard não inicia**
```bash
# Verificar se a porta está em uso
netstat -ano | findstr :3000

# Mudar a porta no .env
DASHBOARD_PORT=3001
```

### **Erro de conexão com banco**
```bash
# Verificar se o bot está rodando
# O dashboard usa a mesma conexão do bot
npm start
```

### **Dados não aparecem**
```bash
# Verificar se há dados no banco
# Adicionar algumas punições primeiro
/adicionar_punição @usuário 50 motivo:Teste
```

### **CORS Error**
```bash
# O CORS já está configurado
# Certifique-se de acessar via http://localhost:3000
```

---

## 🎯 Casos de Uso

### **1. Monitoramento em Tempo Real**
- Admins podem ver quem está pagando punições
- Acompanhar progresso em tempo real
- Identificar usuários com mais punições

### **2. Auditoria**
- Revisar todos os logs do sistema
- Filtrar por tipo de evento
- Verificar ações de moderadores

### **3. Estatísticas**
- Visualizar tendências
- Identificar horários de pico
- Analisar comportamento dos usuários

### **4. Gestão**
- Tomar decisões baseadas em dados
- Identificar problemas rapidamente
- Melhorar processos

---

## 🔐 Segurança

### **Recomendações:**

1. **Não expor publicamente**
   - Use apenas em localhost
   - Ou configure autenticação

2. **Firewall**
   - Bloqueie a porta externamente
   - Permita apenas IPs confiáveis

3. **HTTPS**
   - Use proxy reverso (nginx)
   - Configure certificado SSL

4. **Autenticação** (Futuro)
   - Adicionar login
   - Integrar com Discord OAuth2

---

## 🚀 Próximas Funcionalidades (Opcional)

- [ ] Autenticação com Discord OAuth2
- [ ] Gráficos e charts interativos
- [ ] Exportar relatórios em PDF
- [ ] Notificações em tempo real (WebSocket)
- [ ] Modo escuro
- [ ] Filtros avançados
- [ ] Pesquisa de usuários
- [ ] Histórico completo de punições

---

## ✅ Conclusão

O dashboard está **100% funcional** e pronto para uso!

**Acesse:** http://localhost:3000

**Comandos úteis:**
```bash
npm run dashboard      # Apenas dashboard
npm run start:all      # Bot + Dashboard
```

🎉 **Aproveite o painel web!**
