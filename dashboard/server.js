require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('../database/connection');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== API ENDPOINTS ====================

/**
 * GET /api/stats - Estatísticas gerais
 */
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {};

        // Total de usuários com punições
        const totalUsuarios = await query(
            'SELECT COUNT(*) as total FROM usuarios WHERE punicoes > 0'
        );
        stats.totalUsuarios = parseInt(totalUsuarios.rows[0].total);

        // Total de punições pendentes
        const totalPunicoes = await query(
            'SELECT COALESCE(SUM(punicoes), 0) as total FROM usuarios'
        );
        stats.totalPunicoes = parseInt(totalPunicoes.rows[0].total);

        // Usuários pagando
        const usuariosPagando = await query(
            'SELECT COUNT(*) as total FROM usuarios WHERE pagando = true'
        );
        stats.usuariosPagando = parseInt(usuariosPagando.rows[0].total);

        // Usuários pendentes
        const usuariosPendentes = await query(
            'SELECT COUNT(*) as total FROM usuarios WHERE punicoes > 0 AND pagando = false'
        );
        stats.usuariosPendentes = parseInt(usuariosPendentes.rows[0].total);

        // Total de logs hoje
        const logsHoje = await query(
            `SELECT COUNT(*) as total FROM logs 
             WHERE DATE(created_at) = CURRENT_DATE`
        );
        stats.logsHoje = parseInt(logsHoje.rows[0].total);

        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

/**
 * GET /api/usuarios - Lista de usuários com punições
 */
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                id_discord,
                punicoes,
                pagando,
                progresso,
                erros,
                created_at,
                updated_at
             FROM usuarios 
             WHERE punicoes > 0 
             ORDER BY punicoes DESC, updated_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

/**
 * GET /api/usuarios/pagando - Usuários pagando punições
 */
app.get('/api/usuarios/pagando', async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                id_discord,
                punicoes,
                progresso,
                erros,
                updated_at
             FROM usuarios 
             WHERE pagando = true 
             ORDER BY updated_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários pagando:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários pagando' });
    }
});

/**
 * GET /api/logs - Últimos logs
 */
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const tipo = req.query.tipo || null;
        const nivel = req.query.nivel || null;

        let queryText = `
            SELECT 
                id,
                tipo,
                titulo,
                descricao,
                usuario_id,
                usuario_tag,
                nivel,
                created_at
            FROM logs 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (tipo) {
            queryText += ` AND tipo = $${paramCount}`;
            params.push(tipo);
            paramCount++;
        }

        if (nivel) {
            queryText += ` AND nivel = $${paramCount}`;
            params.push(nivel);
            paramCount++;
        }

        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ error: 'Erro ao buscar logs' });
    }
});

/**
 * GET /api/logs/stats - Estatísticas de logs
 */
app.get('/api/logs/stats', async (req, res) => {
    try {
        // Logs por tipo
        const porTipo = await query(
            `SELECT tipo, COUNT(*) as total 
             FROM logs 
             GROUP BY tipo 
             ORDER BY total DESC 
             LIMIT 10`
        );

        // Logs por nível
        const porNivel = await query(
            `SELECT nivel, COUNT(*) as total 
             FROM logs 
             GROUP BY nivel 
             ORDER BY total DESC`
        );

        // Logs por dia (últimos 7 dias)
        const porDia = await query(
            `SELECT 
                DATE(created_at) as dia,
                COUNT(*) as total 
             FROM logs 
             WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY DATE(created_at) 
             ORDER BY dia DESC`
        );

        res.json({
            porTipo: porTipo.rows,
            porNivel: porNivel.rows,
            porDia: porDia.rows
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de logs:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas de logs' });
    }
});

/**
 * GET /api/usuario/:id - Detalhes de um usuário específico
 */
app.get('/api/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'SELECT * FROM usuarios WHERE id_discord = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Buscar logs relacionados ao usuário
        const logs = await query(
            `SELECT * FROM logs 
             WHERE usuario_id = $1 
             ORDER BY created_at DESC 
             LIMIT 20`,
            [id]
        );

        res.json({
            usuario: result.rows[0],
            logs: logs.rows
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// ==================== PÁGINA PRINCIPAL ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Dashboard iniciado em: http://localhost:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Tratamento de erros
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});
