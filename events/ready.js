const { Events } = require('discord.js');
const { testConnection } = require('../database/connection');
const { setupDatabase } = require('../database/setup');
const { inicializarMural } = require('../utils/muralManager');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🤖 Bot logado como: ${client.user.tag}`);
        console.log(`📊 Servidores: ${client.guilds.cache.size}`);
        console.log(`👥 Usuários: ${client.users.cache.size}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Testar conexão com o banco de dados
        const dbConnected = await testConnection();
        
        if (dbConnected) {
            // Criar tabelas se não existirem
            try {
                await setupDatabase();
                console.log('✅ Banco de dados configurado com sucesso');
            } catch (error) {
                console.error('❌ Erro ao configurar banco de dados:', error.message);
            }
        } else {
            console.error('❌ Não foi possível conectar ao banco de dados');
            console.error('⚠️ O bot continuará rodando, mas funcionalidades de banco estarão indisponíveis');
        }

        // Definir status do bot
        client.user.setPresence({
            activities: [{ name: 'Gerenciando punições 🎖️' }],
            status: 'online',
        });

        // Inicializar mural de punições
        if (dbConnected) {
            await inicializarMural(client);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Bot de punições iniciado com sucesso');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Log no canal #logs se configurado
        if (client.logger) {
            await client.logger.discord(
                '🤖 Bot Iniciado',
                `Bot **${client.user.tag}** iniciado com sucesso!\n` +
                `📊 Servidores: ${client.guilds.cache.size}\n` +
                `👥 Usuários: ${client.users.cache.size}\n` +
                `💾 Banco de dados: ${dbConnected ? '✅ Conectado' : '❌ Desconectado'}`,
                'success'
            );
        }
    },
};
