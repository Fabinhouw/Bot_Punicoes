const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOrCreateUser, updateUser } = require('../database/setup');
const { isModerator, replyNoPermission, getModeratorRoles } = require('../utils/permissions');
const { atualizarMural } = require('../utils/muralManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionar_punição')
        .setDescription('Adiciona punições a um usuário (apenas admins)')
        .addUserOption(option =>
            option
                .setName('usuário')
                .setDescription('Usuário que receberá a punição')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de polichinelos a adicionar')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo da punição (opcional)')
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

            // Verificar se não está tentando punir a si mesmo
            if (targetUser.id === interaction.user.id) {
                return await interaction.editReply({
                    content: '❌ Você não pode adicionar punições a si mesmo!',
                    ephemeral: true
                });
            }

            // Verificar se não é um bot
            if (targetUser.bot) {
                return await interaction.editReply({
                    content: '❌ Você não pode adicionar punições a bots!',
                    ephemeral: true
                });
            }

            // Buscar ou criar usuário no banco
            const userData = await getOrCreateUser(targetUser.id);

            // Calcular novo total de punições
            const novoTotal = userData.punicoes + quantidade;

            // Atualizar no banco de dados
            await updateUser(targetUser.id, {
                punicoes: novoTotal
            });

            // Criar embed de confirmação
            const embed = new EmbedBuilder()
                .setTitle('✅ Punição Adicionada')
                .setColor(0xe74c3c)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '👤 Usuário Punido',
                        value: `${targetUser.tag}`,
                        inline: true
                    },
                    {
                        name: '➕ Quantidade Adicionada',
                        value: `**${quantidade}** polichinelo(s)`,
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

            await interaction.editReply({ embeds: [embed] });

            // Tentar enviar DM para o usuário punido
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Você Recebeu uma Punição')
                    .setColor(0xe74c3c)
                    .setDescription(`Você recebeu **${quantidade}** polichinelo(s) de punição no servidor **${interaction.guild.name}**.`)
                    .addFields(
                        {
                            name: '📝 Motivo',
                            value: motivo,
                            inline: false
                        },
                        {
                            name: '📊 Total de Punições',
                            value: `Você agora tem **${novoTotal}** polichinelo(s) pendente(s).`,
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
                    '➕ Punição Adicionada',
                    `**Administrador:** ${interaction.user.tag} (${interaction.user.id})\n` +
                    `**Usuário Punido:** ${targetUser.tag} (${targetUser.id})\n` +
                    `**Quantidade:** +${quantidade} polichinelo(s)\n` +
                    `**Total Atual:** ${novoTotal} polichinelo(s)\n` +
                    `**Motivo:** ${motivo}\n` +
                    `**Canal:** ${interaction.channel.name}`,
                    'warning'
                );
            }

            // Atualizar mural de punições
            await atualizarMural(client);

        } catch (error) {
            console.error('❌ Erro ao adicionar punição:', error);
            
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao adicionar a punição. Tente novamente mais tarde.',
                ephemeral: true
            });

            if (client.logger) {
                client.logger.error('Erro no comando /adicionar_punição', error, true);
            }
        }
    },
};
