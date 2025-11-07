const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { gerarExemplos } = require('./numberValidator');

/**
 * Cria um canal temporário para pagamento de punições
 * 
 * @param {Guild} guild - Servidor do Discord
 * @param {User} user - Usuário que vai pagar a punição
 * @param {number} totalPunicoes - Total de punições a pagar
 * @returns {Promise<TextChannel>} Canal criado
 */
async function criarCanalPagamento(guild, user, totalPunicoes) {
    try {
        // Nome do canal: pagamento-{username}
        const channelName = `pagamento-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        // Criar o canal
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `Canal temporário para ${user.tag} pagar ${totalPunicoes} polichinelos`,
            permissionOverwrites: [
                {
                    // @everyone não pode ver
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    // Usuário pode ver e enviar mensagens
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
                {
                    // Bot pode gerenciar o canal
                    id: guild.members.me.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                },
            ],
        });

        console.log(`✅ Canal temporário criado: ${channel.name} (${channel.id})`);
        
        // Log detalhado (será usado pelo caller)
        return channel;
    } catch (error) {
        console.error('❌ Erro ao criar canal temporário:', error);
        throw error;
    }
}

/**
 * Envia as regras do pagamento no canal
 * 
 * @param {TextChannel} channel - Canal onde enviar as regras
 * @param {User} user - Usuário que vai pagar
 * @param {number} totalPunicoes - Total de punições
 */
async function enviarRegras(channel, user, totalPunicoes) {
    try {
        const embed = new EmbedBuilder()
            .setTitle('💪 Pagamento de Punições')
            .setColor(0xf39c12)
            .setDescription(
                `Olá ${user}, você tem **${totalPunicoes}** polichinelo(s) para pagar!\n\n` +
                `Siga as regras abaixo para contar corretamente:`
            )
            .addFields(
                {
                    name: '📋 Regras',
                    value: 
                        '1️⃣ Digite os números **por extenso**\n' +
                        '2️⃣ Use **LETRAS MAIÚSCULAS**\n' +
                        '3️⃣ Termine com **ponto de exclamação (!)**\n' +
                        '4️⃣ Siga a **ordem sequencial** (1, 2, 3...)',
                    inline: false
                },
                {
                    name: '✅ Exemplos Corretos',
                    value: gerarExemplos(5),
                    inline: false
                },
                {
                    name: '❌ Exemplos Incorretos',
                    value: 
                        '`um!` (minúscula)\n' +
                        '`UM` (sem !)\n' +
                        '`1!` (número, não extenso)\n' +
                        '`dois!` (fora de ordem)',
                    inline: false
                },
                {
                    name: '⚠️ Atenção',
                    value: 
                        '• Mensagens erradas serão **ignoradas** e registradas no log\n' +
                        '• Você deve seguir a **ordem correta** dos números\n' +
                        '• O canal será **fechado automaticamente** ao terminar',
                    inline: false
                },
                {
                    name: '🎯 Objetivo',
                    value: `Completar **${totalPunicoes}** polichinelo(s)`,
                    inline: false
                }
            )
            .setFooter({ text: 'Boa sorte, soldado! 🎖️' })
            .setTimestamp();

        await channel.send({ content: `${user}`, embeds: [embed] });

        // Mensagem de início
        const inicioEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setDescription('✅ **Pode começar!** Digite `UM!` para iniciar a contagem.')
            .setTimestamp();

        await channel.send({ embeds: [inicioEmbed] });

        console.log(`✅ Regras enviadas no canal ${channel.name}`);
    } catch (error) {
        console.error('❌ Erro ao enviar regras:', error);
        throw error;
    }
}

/**
 * Envia mensagem de progresso no canal
 * 
 * @param {TextChannel} channel - Canal
 * @param {number} progresso - Progresso atual
 * @param {number} total - Total de punições
 */
async function enviarProgresso(channel, progresso, total) {
    try {
        const porcentagem = Math.round((progresso / total) * 100);
        const barraProgresso = gerarBarraProgresso(progresso, total);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setDescription(
                `📊 **Progresso:** ${progresso}/${total} (${porcentagem}%)\n` +
                `${barraProgresso}`
            );

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ Erro ao enviar progresso:', error);
    }
}

/**
 * Gera barra de progresso visual
 * 
 * @param {number} atual - Valor atual
 * @param {number} total - Valor total
 * @returns {string} Barra de progresso
 */
function gerarBarraProgresso(atual, total) {
    const tamanho = 20;
    const preenchido = Math.round((atual / total) * tamanho);
    const vazio = tamanho - preenchido;
    
    return '█'.repeat(preenchido) + '░'.repeat(vazio);
}

/**
 * Fecha o canal temporário após conclusão
 * 
 * @param {TextChannel} channel - Canal a ser fechado
 * @param {User} user - Usuário que completou
 * @param {number} tempo - Tempo em segundos (opcional)
 */
async function fecharCanal(channel, user, tempo = 10) {
    try {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Parabéns!')
            .setColor(0x2ecc71)
            .setDescription(
                `${user}, você completou todas as suas punições!\n\n` +
                `✅ Suas punições foram zeradas.\n` +
                `🔒 Este canal será fechado em **${tempo} segundos**.`
            )
            .setFooter({ text: 'Bom trabalho, soldado! 🎖️' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Aguardar e deletar o canal
        setTimeout(async () => {
            try {
                const channelName = channel.name;
                const channelId = channel.id;
                await channel.delete('Pagamento de punição concluído');
                console.log(`✅ Canal ${channelName} (${channelId}) deletado com sucesso`);
                
                // Log no Discord (se disponível no contexto)
                // Será feito pelo caller que tem acesso ao client
            } catch (error) {
                console.error('❌ Erro ao deletar canal:', error);
            }
        }, tempo * 1000);

    } catch (error) {
        console.error('❌ Erro ao fechar canal:', error);
    }
}

module.exports = {
    criarCanalPagamento,
    enviarRegras,
    enviarProgresso,
    fecharCanal
};
