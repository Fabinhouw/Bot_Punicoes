const { Events } = require('discord.js');

module.exports = {
    name: Events.Error,
    async execute(error, client) {
        console.error('❌ Erro do Discord.js:', error);

        // Log no canal #logs se configurado
        if (client && client.logger) {
            await client.logger.discord(
                '❌ Erro do Bot',
                `**Erro:** \`\`\`${error.message}\`\`\`\n` +
                `**Stack:** \`\`\`${error.stack?.substring(0, 1000) || 'N/A'}\`\`\``,
                'error'
            );
        }
    },
};
