const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const Logger = require('./utils/logger');
const { loadCommands } = require('./utils/commandLoader');
const { loadEvents } = require('./utils/eventLoader');

// Verificar se o token existe
if (!config.discord.token) {
    console.error('❌ ERRO: Token do Discord não encontrado!');
    console.error('⚠️ Configure o arquivo .env com seu DISCORD_TOKEN');
    process.exit(1);
}

// Criar cliente do Discord com as intents necessárias
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ],
});

// Inicializar sistema de logs
client.logger = new Logger(client);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Iniciando Bot de Punições - RP Militar');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Carregar comandos
console.log('\n📦 Carregando comandos...');
loadCommands(client);

// Carregar eventos
console.log('\n📡 Carregando eventos...');
loadEvents(client);

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado (unhandledRejection):', error);
    if (client.logger) {
        client.logger.error('Erro não tratado', error, true, '❌ Unhandled Rejection');
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado (uncaughtException):', error);
    if (client.logger) {
        client.logger.error('Erro não capturado', error, true, '❌ Uncaught Exception');
    }
});

// Login no Discord
console.log('\n🔐 Conectando ao Discord...');
client.login(config.discord.token).catch((error) => {
    console.error('❌ Erro ao fazer login no Discord:', error.message);
    console.error('⚠️ Verifique se o token está correto no arquivo .env');
    process.exit(1);
});
