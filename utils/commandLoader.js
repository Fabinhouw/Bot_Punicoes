const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

/**
 * Carrega todos os comandos da pasta commands/
 */
function loadCommands(client) {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '..', 'commands');

    // Verificar se a pasta commands existe
    if (!fs.existsSync(commandsPath)) {
        console.log('⚠️ Pasta "commands" não encontrada. Criando...');
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    if (commandFiles.length === 0) {
        console.log('⚠️ Nenhum comando encontrado na pasta "commands"');
        return;
    }

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);

            // Verificar se o comando tem as propriedades necessárias
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Comando carregado: ${command.data.name}`);
            } else {
                console.log(`⚠️ Comando em ${file} está faltando "data" ou "execute"`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar comando ${file}:`, error.message);
        }
    }

    console.log(`✅ Total de comandos carregados: ${client.commands.size}`);
}

module.exports = { loadCommands };
