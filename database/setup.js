const { query } = require('./connection');

/**
 * Cria as tabelas necessárias no banco de dados
 */
async function setupDatabase() {
    console.log('🔧 Iniciando setup do banco de dados...');

    try {
        // Criar tabela de usuários
        await query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_discord TEXT PRIMARY KEY,
                punicoes INT DEFAULT 0,
                pagando BOOLEAN DEFAULT false,
                progresso INT DEFAULT 0,
                erros INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Adicionar campo 'erros' se não existir (para bancos existentes)
        await query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS erros INT DEFAULT 0
        `);

        console.log('✅ Tabela "usuarios" criada/verificada com sucesso');

        // Criar índice para melhorar performance em consultas de usuários pagando
        await query(`
            CREATE INDEX IF NOT EXISTS idx_usuarios_pagando 
            ON usuarios(pagando) 
            WHERE pagando = true
        `);

        console.log('✅ Índices criados com sucesso');

        // Criar tabela de logs
        await query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                tipo TEXT NOT NULL,
                titulo TEXT NOT NULL,
                descricao TEXT,
                usuario_id TEXT,
                usuario_tag TEXT,
                nivel TEXT DEFAULT 'info',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Criar índice para logs por data
        await query(`
            CREATE INDEX IF NOT EXISTS idx_logs_created_at 
            ON logs(created_at DESC)
        `);

        // Criar índice para logs por tipo
        await query(`
            CREATE INDEX IF NOT EXISTS idx_logs_tipo 
            ON logs(tipo)
        `);

        console.log('✅ Tabelas criadas/verificadas com sucesso');
        console.log('✅ Setup do banco de dados concluído');

        return true;
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message);
        throw error;
    }
}

/**
 * Função para obter ou criar um usuário
 */
async function getOrCreateUser(idDiscord) {
    try {
        // Tentar buscar o usuário
        const result = await query(
            'SELECT * FROM usuarios WHERE id_discord = $1',
            [idDiscord]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // Se não existir, criar
        const insertResult = await query(
            `INSERT INTO usuarios (id_discord, punicoes, pagando, progresso) 
             VALUES ($1, 0, false, 0) 
             RETURNING *`,
            [idDiscord]
        );

        console.log(`✅ Novo usuário criado: ${idDiscord}`);
        return insertResult.rows[0];
    } catch (error) {
        console.error('❌ Erro ao obter/criar usuário:', error.message);
        throw error;
    }
}

/**
 * Atualizar dados do usuário
 */
async function updateUser(idDiscord, data) {
    try {
        const fields = [];
        const values = [];
        let paramCount = 1;

        // Construir query dinamicamente baseado nos campos fornecidos
        if (data.punicoes !== undefined) {
            fields.push(`punicoes = $${paramCount++}`);
            values.push(data.punicoes);
        }
        if (data.pagando !== undefined) {
            fields.push(`pagando = $${paramCount++}`);
            values.push(data.pagando);
        }
        if (data.progresso !== undefined) {
            fields.push(`progresso = $${paramCount++}`);
            values.push(data.progresso);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(idDiscord);

        const queryText = `
            UPDATE usuarios 
            SET ${fields.join(', ')} 
            WHERE id_discord = $${paramCount}
            RETURNING *
        `;

        const result = await query(queryText, values);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error.message);
        throw error;
    }
}

module.exports = {
    setupDatabase,
    getOrCreateUser,
    updateUser
};
