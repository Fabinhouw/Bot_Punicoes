const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config/config');

// Verificar se as variáveis necessárias existem
if (!config.discord.token || !config.discord.clientId) {
    console.error('❌ ERRO: Token ou Client ID não encontrado!');
    console.error('⚠️ Configure o arquivo .env com DISCORD_TOKEN e CLIENT_ID');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Verificar se a pasta commands existe
if (!fs.existsSync(commandsPath)) {
    console.log('⚠️ Pasta "commands" não encontrada. Nenhum comando para registrar.');
    process.exit(0);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Carregar todos os comandos
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Comando carregado: ${command.data.name}`);
    } else {
        console.log(`⚠️ Comando em ${file} está faltando "data" ou "execute"`);
    }
}

if (commands.length === 0) {
    console.log('⚠️ Nenhum comando encontrado para registrar.');
    process.exit(0);
}

// Criar instância REST
const rest = new REST().setToken(config.discord.token);

// Registrar comandos
(async () => {
    try {
        console.log(`\n🔄 Registrando ${commands.length} comando(s)...`);

        let data;
        
        // Se GUILD_ID estiver definido, registrar apenas no servidor específico (mais rápido)
        if (config.discord.guildId) {
            console.log(`📍 Registrando comandos no servidor: ${config.discord.guildId}`);
            data = await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commands },
            );
        } else {
            // Caso contrário, registrar globalmente (pode levar até 1 hora)
            console.log('🌍 Registrando comandos globalmente (pode levar até 1 hora)');
            data = await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands },
            );
        }

        console.log(`✅ ${data.length} comando(s) registrado(s) com sucesso!`);
        
        // Listar comandos registrados
        console.log('\n📋 Comandos registrados:');
        data.forEach(cmd => {
            console.log(`   - /${cmd.name}: ${cmd.description}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
        
        if (error.code === 50001) {
            console.error('⚠️ Bot não tem permissão. Verifique se o bot está no servidor.');
        } else if (error.code === 10002) {
            console.error('⚠️ Client ID inválido. Verifique o CLIENT_ID no .env');
        }
    }
})();
