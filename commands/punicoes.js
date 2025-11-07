const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../database/setup');
const { isModerator } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('punições')
        .setDescription('Mostra a quantidade de punições de um usuário')
        .addUserOption(option =>
            option
                .setName('usuário')
                .setDescription('Usuário para consultar (apenas admins podem ver de outros)')
                .setRequired(false)
        ),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            // Verificar qual usuário consultar
            const targetUser = interaction.options.getUser('usuário');
            const member = interaction.member;

            // Se especificou outro usuário, verificar se é moderador
            if (targetUser && targetUser.id !== interaction.user.id) {
                if (!isModerator(member)) {
                    return await interaction.editReply({
                        content: '❌ Apenas Administradores e Oficiais podem consultar punições de outros usuários!',
                        ephemeral: true
                    });
                }
            }

            // Definir usuário alvo (se não especificou, usa o próprio)
            const userToCheck = targetUser || interaction.user;

            // Buscar dados do usuário no banco
            const userData = await getOrCreateUser(userToCheck.id);

            // Criar embed com as informações
            const embed = new EmbedBuilder()
                .setTitle('📋 Punições Registradas')
                .setColor(userData.punicoes > 0 ? 0xe74c3c : 0x2ecc71)
                .setThumbnail(userToCheck.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '👤 Usuário',
                        value: `${userToCheck.tag}`,
                        inline: true
                    },
                    {
                        name: '🎖️ Punições Pendentes',
                        value: `**${userData.punicoes}** polichinelo(s)`,
                        inline: true
                    },
                    {
                        name: '📊 Status',
                        value: userData.pagando ? '🔄 Pagando punição' : '✅ Livre',
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${userToCheck.id}` });

            // Se está pagando, mostrar progresso
            if (userData.pagando) {
                embed.addFields({
                    name: '📈 Progresso Atual',
                    value: `${userData.progresso}/${userData.punicoes} polichinelos`,
                    inline: false
                });
            }

            // Mostrar total de erros se houver
            if (userData.erros > 0) {
                embed.addFields({
                    name: '⚠️ Erros Cometidos',
                    value: `${userData.erros} erro(s) de formatação`,
                    inline: false
                });
            }

            // Adicionar mensagem motivacional
            if (userData.punicoes > 0 && !userData.pagando) {
                embed.addFields({
                    name: '💪 Atenção',
                    value: 'Você tem punições pendentes! Vá ao canal de mural de punições para pagar.',
                    inline: false
                });
            } else if (userData.punicoes === 0) {
                embed.addFields({
                    name: '🎉 Parabéns',
                    value: 'Nenhuma punição pendente! Continue assim, soldado!',
                    inline: false
                });
            }

            await interaction.editReply({ 
                embeds: [embed]
            });

            // Log no canal #logs
            if (client.logger) {
                const logMessage = targetUser && targetUser.id !== interaction.user.id
                    ? `${interaction.user.tag} consultou punições de ${userToCheck.tag}`
                    : `${interaction.user.tag} consultou suas próprias punições`;

                await client.logger.discord(
                    '📋 Consulta de Punições',
                    `**Executor:** ${interaction.user.tag} (${interaction.user.id})\n` +
                    `**Usuário Consultado:** ${userToCheck.tag} (${userToCheck.id})\n` +
                    `**Punições:** ${userData.punicoes}\n` +
                    `**Status:** ${userData.pagando ? 'Pagando' : 'Livre'}`,
                    'info'
                );
            }

        } catch (error) {
            console.error('❌ Erro ao consultar punições:', error);
            
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao consultar as punições. Tente novamente mais tarde.',
                ephemeral: true
            });

            if (client.logger) {
                client.logger.error('Erro no comando /punições', error, true);
            }
        }
    },
};
