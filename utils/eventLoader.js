const fs = require('fs');
const path = require('path');

/**
 * Carrega todos os eventos da pasta events/
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');

    // Verificar se a pasta events existe
    if (!fs.existsSync(eventsPath)) {
        console.log('⚠️ Pasta "events" não encontrada. Criando...');
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    if (eventFiles.length === 0) {
        console.log('⚠️ Nenhum evento encontrado na pasta "events"');
        return;
    }

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const event = require(filePath);

            // Verificar se o evento tem as propriedades necessárias
            if (!event.name) {
                console.log(`⚠️ Evento em ${file} está faltando a propriedade "name"`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            console.log(`✅ Evento carregado: ${event.name} ${event.once ? '(once)' : ''}`);
        } catch (error) {
            console.error(`❌ Erro ao carregar evento ${file}:`, error.message);
        }
    }
}

module.exports = { loadEvents };
