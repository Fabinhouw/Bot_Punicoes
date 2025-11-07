const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOrCreateUser, updateUser } = require('../database/setup');
const { isModerator, replyNoPermission, getModeratorRoles } = require('../utils/permissions');
const { atualizarMural } = require('../utils/muralManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remover_punição')
        .setDescription('Remove punições de um usuário (apenas admins)')
        .addUserOption(option =>
            option
                .setName('usuário')
                .setDescription('Usuário que terá punições removidas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de polichinelos a remover')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo da remoção (opcional)')
                .setRequired(false)
                .setMaxLength(200)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        // Verificar permissão de moderador (Admin ou Oficial)
        if (!isModerator(interaction.member)) {
            return await replyNoPermission(interaction, 'moderator');
        }

        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('usuário');
            const quantidade = interaction.options.getInteger('quantidade');
            const motivo = interaction.options.getString('motivo') || 'Não especificado';

            // Verificar se não é um bot
            if (targetUser.bot) {
                return await interaction.editReply({
                    content: '❌ Você não pode remover punições de bots!',
                    ephemeral: true
                });
            }

            // Buscar ou criar usuário no banco
            const userData = await getOrCreateUser(targetUser.id);

            // Verificar se o usuário tem punições
            if (userData.punicoes === 0) {
                return await interaction.editReply({
                    content: `❌ ${targetUser.tag} não possui punições pendentes!`,
                    ephemeral: true
                });
            }

            // Calcular novo total (não pode ser negativo)
            const quantidadeRemover = Math.min(quantidade, userData.punicoes);
            const novoTotal = Math.max(0, userData.punicoes - quantidadeRemover);

            // Atualizar no banco de dados
            await updateUser(targetUser.id, {
                punicoes: novoTotal
            });

            // Criar embed de confirmação
            const embed = new EmbedBuilder()
                .setTitle('✅ Punição Removida')
                .setColor(0x2ecc71)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '👤 Usuário',
                        value: `${targetUser.tag}`,
                        inline: true
                    },
                    {
                        name: '➖ Quantidade Removida',
                        value: `**${quantidadeRemover}** polichinelo(s)`,
                        inline: true
                    },
                    {
                        name: '📊 Total Atual',
                        value: `**${novoTotal}** polichinelo(s)`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value: motivo,
                        inline: false
                    },
                    {
                        name: '👮 Administrador',
                        value: `${interaction.user.tag}`,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: `ID do usuário: ${targetUser.id}` });

            // Adicionar aviso se tentou remover mais do que tinha
            if (quantidade > userData.punicoes) {
                embed.addFields({
                    name: '⚠️ Aviso',
                    value: `Tentou remover ${quantidade}, mas o usuário tinha apenas ${userData.punicoes}. Todas as punições foram removidas.`,
                    inline: false
                });
            }

            // Adicionar mensagem de parabéns se zerou as punições
            if (novoTotal === 0) {
                embed.addFields({
                    name: '🎉 Parabéns',
                    value: 'Todas as punições foram quitadas!',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

            // Tentar enviar DM para o usuário
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('✅ Punição Removida')
                    .setColor(0x2ecc71)
                    .setDescription(`**${quantidadeRemover}** polichinelo(s) foram removidos das suas punições no servidor **${interaction.guild.name}**.`)
                    .addFields(
                        {
                            name: '📝 Motivo',
                            value: motivo,
                            inline: false
                        },
                        {
                            name: '📊 Total de Punições',
                            value: novoTotal === 0 
                                ? '🎉 Você não tem mais punições pendentes!' 
                                : `Você ainda tem **${novoTotal}** polichinelo(s) pendente(s).`,
                            inline: false
                        }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`⚠️ Não foi possível enviar DM para ${targetUser.tag}`);
            }

            // Log no canal #logs
            if (client.logger) {
                await client.logger.discord(
                    '➖ Punição Removida',
                    `**Administrador:** ${interaction.user.tag} (${interaction.user.id})\n` +
                    `**Usuário:** ${targetUser.tag} (${targetUser.id})\n` +
                    `**Quantidade Removida:** -${quantidadeRemover} polichinelo(s)\n` +
                    `**Total Atual:** ${novoTotal} polichinelo(s)\n` +
                    `**Motivo:** ${motivo}\n` +
                    `**Canal:** ${interaction.channel.name}`,
                    'success'
                );
            }

            // Atualizar mural de punições
            await atualizarMural(client);

        } catch (error) {
            console.error('❌ Erro ao remover punição:', error);
            
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao remover a punição. Tente novamente mais tarde.',
                ephemeral: true
            });

            if (client.logger) {
                client.logger.error('Erro no comando /remover_punição', error, true);
            }
        }
    },
};
