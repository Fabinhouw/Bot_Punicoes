const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { query } = require('../database/connection');
const config = require('../config/config');

/**
 * Atualiza o mural de punições no canal fixo
 * @param {Client} client - Cliente do Discord
 */
async function atualizarMural(client) {
    try {
        const muralChannelId = config.discord.muralChannelId;
        
        if (!muralChannelId) {
            console.log('⚠️ MURAL_CHANNEL_ID não configurado');
            return;
        }

        const channel = await client.channels.fetch(muralChannelId);
        if (!channel || !channel.isTextBased()) {
            console.error('❌ Canal de mural não encontrado ou não é de texto');
            return;
        }

        // Buscar todos os usuários com punições
        const result = await query(
            'SELECT * FROM usuarios WHERE punicoes > 0 ORDER BY punicoes DESC, updated_at DESC'
        );

        // Criar embed com a lista
        const embed = new EmbedBuilder()
            .setTitle('🎖️ MURAL DE PUNIÇÕES - RP MILITAR')
            .setColor(result.rows.length > 0 ? 0xe74c3c : 0x2ecc71)
            .setDescription(
                '```ansi\n' +
                '\u001b[1;33m╔══════════════════════════════════════╗\n' +
                '\u001b[1;33m║   REGISTRO DE PUNIÇÕES PENDENTES    ║\n' +
                '\u001b[1;33m╚══════════════════════════════════════╝\u001b[0m\n' +
                '```\n' +
                '**Soldados com punições devem reportar-se imediatamente!**\n' +
                'Clique no botão abaixo para iniciar o pagamento.'
            )
            .setTimestamp()
            .setFooter({ 
                text: `Última atualização • ${result.rows.length} soldado(s) em débito`,
                iconURL: client.user.displayAvatarURL()
            });

        if (result.rows.length === 0) {
            embed.addFields({
                name: '🎉 Nenhuma Punição Pendente',
                value: 'Todos os soldados estão em dia! Parabéns!',
                inline: false
            });
        } else {
            let listaTexto = '';
            let totalPunicoes = 0;

            for (let i = 0; i < result.rows.length; i++) {
                const userData = result.rows[i];
                totalPunicoes += userData.punicoes;
                
                try {
                    const user = await client.users.fetch(userData.id_discord);
                    const posicao = i + 1;
                    const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : '▫️';
                    const status = userData.pagando ? '🔄 **Pagando**' : '⏸️ Pendente';
                    const progresso = userData.pagando 
                        ? ` \`[${userData.progresso}/${userData.punicoes}]\`` 
                        : '';
                    
                    // Barra de progresso visual para quem está pagando
                    let barraProgresso = '';
                    if (userData.pagando && userData.punicoes > 0) {
                        const percentual = Math.round((userData.progresso / userData.punicoes) * 10);
                        barraProgresso = '\n  ' + '█'.repeat(percentual) + '░'.repeat(10 - percentual) + ` ${Math.round((userData.progresso / userData.punicoes) * 100)}%`;
                    }
                    
                    listaTexto += `${medalha} **${posicao}º** • ${user.username}\n`;
                    listaTexto += `  └ ${userData.punicoes} polichinelo(s) • ${status}${progresso}${barraProgresso}\n\n`;
                } catch (error) {
                    // Se não conseguir buscar o usuário, mostrar apenas o ID
                    listaTexto += `▫️ ID: ${userData.id_discord}\n`;
                    listaTexto += `  └ ${userData.punicoes} polichinelo(s) • ⏸️ Pendente\n\n`;
                }
            }

            embed.addFields(
                {
                    name: `👥 SOLDADOS EM DÉBITO (${result.rows.length})`,
                    value: listaTexto || 'Nenhum',
                    inline: false
                },
                {
                    name: '📊 ESTATÍSTICAS',
                    value: 
                        `**Total de Punições:** ${totalPunicoes} polichinelo(s)\n` +
                        `**Soldados Pagando:** ${result.rows.filter(u => u.pagando).length}\n` +
                        `**Soldados Pendentes:** ${result.rows.filter(u => !u.pagando).length}`,
                    inline: false
                }
            );
        }

        // Criar botão de pagamento
        const button = new ButtonBuilder()
            .setCustomId('pagar_punicao')
            .setLabel('💪 Pagar Minhas Punições')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎖️');

        const row = new ActionRowBuilder().addComponents(button);

        // Buscar mensagens antigas do bot no canal
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);

        if (botMessages.size > 0) {
            // Atualizar a primeira mensagem do bot
            const firstMessage = botMessages.first();
            await firstMessage.edit({
                embeds: [embed],
                components: [row]
            });
            console.log('✅ Mural de punições atualizado');
        } else {
            // Enviar nova mensagem
            await channel.send({
                embeds: [embed],
                components: [row]
            });
            console.log('✅ Mural de punições criado');
        }

    } catch (error) {
        console.error('❌ Erro ao atualizar mural:', error);
    }
}

/**
 * Inicializa o mural de punições
 * @param {Client} client - Cliente do Discord
 */
async function inicializarMural(client) {
    try {
        console.log('🔧 Inicializando mural de punições...');
        await atualizarMural(client);
        
        // Atualizar o mural a cada 5 minutos
        setInterval(async () => {
            await atualizarMural(client);
        }, 5 * 60 * 1000); // 5 minutos

        console.log('✅ Mural de punições inicializado (atualização a cada 5 minutos)');
    } catch (error) {
        console.error('❌ Erro ao inicializar mural:', error);
    }
}

module.exports = {
    atualizarMural,
    inicializarMural
};
