const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../database/connection');
const { isModerator, replyNoPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listar_punições')
        .setDescription('Lista todos os usuários com punições pendentes (apenas admins)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        // Verificar permissão de moderador (Admin ou Oficial)
        if (!isModerator(interaction.member)) {
            return await replyNoPermission(interaction, 'moderator');
        }

        await interaction.deferReply();

        try {
            // Buscar todos os usuários com punições pendentes
            const result = await query(
                'SELECT * FROM usuarios WHERE punicoes > 0 ORDER BY punicoes DESC, updated_at DESC'
            );

            if (result.rows.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('📋 Lista de Punições')
                    .setDescription('🎉 Nenhum usuário com punições pendentes!')
                    .setColor(0x2ecc71)
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            // Criar embed com a lista
            const embed = new EmbedBuilder()
                .setTitle('📋 Lista de Punições Pendentes')
                .setColor(0xe74c3c)
                .setDescription(`Total de usuários com punições: **${result.rows.length}**`)
                .setTimestamp();

            // Adicionar campos para cada usuário (máximo 25 campos)
            const maxFields = 25;
            let totalPunicoes = 0;

            for (let i = 0; i < Math.min(result.rows.length, maxFields); i++) {
                const userData = result.rows[i];
                totalPunicoes += userData.punicoes;

                try {
                    const user = await client.users.fetch(userData.id_discord);
                    const status = userData.pagando ? '🔄 Pagando' : '⏸️ Pendente';
                    const progresso = userData.pagando 
                        ? ` (${userData.progresso}/${userData.punicoes})` 
                        : '';

                    embed.addFields({
                        name: `${i + 1}. ${user.tag}`,
                        value: `**${userData.punicoes}** polichinelo(s) ${status}${progresso}`,
                        inline: true
                    });
                } catch (error) {
                    // Se não conseguir buscar o usuário, mostrar apenas o ID
                    embed.addFields({
                        name: `${i + 1}. ID: ${userData.id_discord}`,
                        value: `**${userData.punicoes}** polichinelo(s)`,
                        inline: true
                    });
                }
            }

            // Se houver mais de 25 usuários, adicionar aviso
            if (result.rows.length > maxFields) {
                embed.addFields({
                    name: '⚠️ Lista Truncada',
                    value: `Mostrando apenas os primeiros ${maxFields} de ${result.rows.length} usuários.`,
                    inline: false
                });
            }

            // Adicionar total de punições
            embed.addFields({
                name: '📊 Total Geral',
                value: `**${totalPunicoes}** polichinelo(s) pendentes no servidor`,
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

            // Log no canal #logs
            if (client.logger) {
                await client.logger.discord(
                    '📋 Lista de Punições Consultada',
                    `**Administrador:** ${interaction.user.tag} (${interaction.user.id})\n` +
                    `**Usuários com Punições:** ${result.rows.length}\n` +
                    `**Total de Punições:** ${totalPunicoes} polichinelo(s)\n` +
                    `**Canal:** ${interaction.channel.name}`,
                    'info'
                );
            }

        } catch (error) {
            console.error('❌ Erro ao listar punições:', error);
            
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao listar as punições. Tente novamente mais tarde.',
                ephemeral: true
            });

            if (client.logger) {
                client.logger.error('Erro no comando /listar_punições', error, true);
            }
        }
    },
};
