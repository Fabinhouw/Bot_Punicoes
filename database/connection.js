const { Pool } = require('pg');
const config = require('../config/config');

// Criar pool de conexões com o PostgreSQL
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Evento de erro no pool
pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool de conexões do PostgreSQL:', err);
});

// Função para testar a conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
        return false;
    }
}

// Função para executar queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`📊 Query executada em ${duration}ms`);
        return res;
    } catch (error) {
        console.error('❌ Erro ao executar query:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    query,
    testConnection
};
