// Configuração da API
const API_URL = 'http://localhost:3000/api';

// ==================== UTILITÁRIOS ====================

/**
 * Formata data para exibição
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formata tempo relativo
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return `${seconds}s atrás`;
}

/**
 * Calcula porcentagem
 */
function calcPercentage(current, total) {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
}

// ==================== TABS ====================

/**
 * Alterna entre tabs
 */
function showTab(tabName) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab selecionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Ativar botão correspondente
    event.target.classList.add('active');
    
    // Carregar dados da tab
    if (tabName === 'usuarios') loadUsuarios();
    if (tabName === 'pagando') loadPagando();
    if (tabName === 'logs') loadLogs();
}

// ==================== ESTATÍSTICAS ====================

/**
 * Carrega estatísticas gerais
 */
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('totalUsuarios').textContent = stats.totalUsuarios;
        document.getElementById('totalPunicoes').textContent = stats.totalPunicoes;
        document.getElementById('usuariosPagando').textContent = stats.usuariosPagando;
        document.getElementById('usuariosPendentes').textContent = stats.usuariosPendentes;
        document.getElementById('logsHoje').textContent = stats.logsHoje;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ==================== USUÁRIOS ====================

/**
 * Carrega lista de usuários com punições
 */
async function loadUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const usuarios = await response.json();
        
        const tbody = document.getElementById('usuarios-tbody');
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">Nenhum usuário com punições pendentes</td></tr>';
            return;
        }
        
        tbody.innerHTML = usuarios.map((user, index) => {
            const posicao = index + 1;
            const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : posicao;
            const status = user.pagando ? 
                '<span class="badge badge-info">🔄 Pagando</span>' : 
                '<span class="badge badge-warning">⏸️ Pendente</span>';
            const progresso = user.pagando ? 
                `${user.progresso}/${user.punicoes}` : 
                '-';
            const erros = user.erros > 0 ? 
                `<span class="badge badge-danger">${user.erros}</span>` : 
                '<span style="color: #95a5a6;">0</span>';
            
            return `
                <tr>
                    <td><strong>${medalha}</strong></td>
                    <td><code>${user.id_discord}</code></td>
                    <td><strong>${user.punicoes}</strong> polichinelo(s)</td>
                    <td>${status}</td>
                    <td>${progresso}</td>
                    <td>${erros}</td>
                    <td>${formatRelativeTime(user.updated_at)}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('usuarios-tbody').innerHTML = 
            '<tr><td colspan="7" class="loading">Erro ao carregar dados</td></tr>';
    }
}

// ==================== PAGAMENTOS ====================

/**
 * Carrega usuários pagando punições
 */
async function loadPagando() {
    try {
        const response = await fetch(`${API_URL}/usuarios/pagando`);
        const usuarios = await response.json();
        
        const container = document.getElementById('pagando-container');
        
        if (usuarios.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum pagamento em andamento no momento</p>';
            return;
        }
        
        container.innerHTML = usuarios.map(user => {
            const percentage = calcPercentage(user.progresso, user.punicoes);
            const errosText = user.erros > 0 ? `⚠️ ${user.erros} erro(s)` : '✅ Sem erros';
            
            return `
                <div class="payment-card">
                    <h3>👤 ${user.id_discord}</h3>
                    <p><strong>Total:</strong> ${user.punicoes} polichinelo(s)</p>
                    <p><strong>Progresso:</strong> ${user.progresso}/${user.punicoes}</p>
                    <p><strong>Erros:</strong> ${errosText}</p>
                    <p><strong>Última atualização:</strong> ${formatRelativeTime(user.updated_at)}</p>
                    <div class="payment-progress">
                        <div class="payment-progress-text">
                            <span>Progresso</span>
                            <span><strong>${percentage}%</strong></span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        document.getElementById('pagando-container').innerHTML = 
            '<p class="loading">Erro ao carregar dados</p>';
    }
}

// ==================== LOGS ====================

/**
 * Carrega últimos logs
 */
async function loadLogs() {
    try {
        const nivel = document.getElementById('logNivel').value;
        const url = nivel ? `${API_URL}/logs?nivel=${nivel}&limit=100` : `${API_URL}/logs?limit=100`;
        
        const response = await fetch(url);
        const logs = await response.json();
        
        const container = document.getElementById('logs-container');
        
        if (logs.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum log encontrado</p>';
            return;
        }
        
        container.innerHTML = logs.map(log => {
            return `
                <div class="log-item ${log.nivel}">
                    <div class="log-header">
                        <span class="log-title">${log.titulo}</span>
                        <span class="log-time">${formatDate(log.created_at)}</span>
                    </div>
                    <div class="log-description">${log.descricao || 'Sem descrição'}</div>
                    ${log.usuario_tag ? `<div style="margin-top: 8px; color: #7f8c8d;"><strong>Usuário:</strong> ${log.usuario_tag}</div>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
        document.getElementById('logs-container').innerHTML = 
            '<p class="loading">Erro ao carregar logs</p>';
    }
}

// ==================== RELÓGIO ====================

/**
 * Atualiza relógio no header
 */
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// ==================== INICIALIZAÇÃO ====================

/**
 * Carrega todos os dados
 */
function loadAllData() {
    loadStats();
    loadUsuarios();
}

/**
 * Inicializa o dashboard
 */
function init() {
    console.log('🚀 Dashboard iniciado');
    
    // Carregar dados iniciais
    loadAllData();
    
    // Atualizar relógio
    updateClock();
    setInterval(updateClock, 1000);
    
    // Atualizar dados automaticamente a cada 10 segundos
    setInterval(loadAllData, 10000);
    
    console.log('✅ Atualização automática ativada (10s)');
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
