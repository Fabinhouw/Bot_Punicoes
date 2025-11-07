const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica a latência do bot'),
    
    async execute(interaction, client) {
        const sent = await interaction.reply({ 
            content: '🏓 Calculando ping...', 
            fetchReply: true 
        });
        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);
        
        await interaction.editReply(
            `🏓 Pong!\n` +
            `📊 Latência: ${latency}ms\n` +
            `💓 API: ${apiLatency}ms`
        );
    },
};
