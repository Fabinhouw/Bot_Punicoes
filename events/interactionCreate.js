const { Events } = require('discord.js');
const { getOrCreateUser, updateUser } = require('../database/setup');
const { criarCanalPagamento, enviarRegras } = require('../utils/channelManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handler para botões
        if (interaction.isButton()) {
            if (interaction.customId === 'pagar_punicao') {
                await handlePagarPunicao(interaction, client);
            }
            return;
        }

        // Verificar se é um comando de slash
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ Comando não encontrado: ${interaction.commandName}`);
            return;
        }

        try {
            console.log(`🔧 Executando comando: ${interaction.commandName} por ${interaction.user.tag}`);
            await command.execute(interaction, client);

            // Log no canal #logs se configurado
            if (client.logger) {
                await client.logger.discord(
                    '⚙️ Comando Executado',
                    `**Comando:** \`/${interaction.commandName}\`\n` +
                    `**Usuário:** ${interaction.user.tag} (${interaction.user.id})\n` +
                    `**Canal:** ${interaction.channel.name}\n` +
                    `**Servidor:** ${interaction.guild.name}`,
                    'info'
                );
            }
        } catch (error) {
            console.error(`❌ Erro ao executar comando ${interaction.commandName}:`, error);

            // Log de erro no canal #logs
            if (client.logger) {
                await client.logger.discord(
                    '❌ Erro em Comando',
                    `**Comando:** \`/${interaction.commandName}\`\n` +
                    `**Usuário:** ${interaction.user.tag}\n` +
                    `**Erro:** \`\`\`${error.message}\`\`\``,
                    'error'
                );
            }

            // Responder ao usuário
            const errorMessage = {
                content: '❌ Ocorreu um erro ao executar este comando!',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};

/**
 * Handler para o botão de pagar punição
 */
async function handlePagarPunicao(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const user = interaction.user;
        const guild = interaction.guild;

        // Buscar dados do usuário
        const userData = await getOrCreateUser(user.id);

        // Verificar se tem punições
        if (userData.punicoes === 0) {
            return await interaction.editReply({
                content: '❌ Você não tem punições pendentes!',
                ephemeral: true
            });
        }

        // Verificar se já está pagando
        if (userData.pagando) {
            return await interaction.editReply({
                content: '❌ Você já está pagando uma punição! Complete o pagamento atual primeiro.',
                ephemeral: true
            });
        }

        // Criar canal temporário
        const channel = await criarCanalPagamento(guild, user, userData.punicoes);

        // Atualizar status no banco
        await updateUser(user.id, {
            pagando: true,
            progresso: 0
        });

        // Enviar regras no canal
        await enviarRegras(channel, user, userData.punicoes);

        // Responder ao usuário
        await interaction.editReply({
            content: `✅ Canal de pagamento criado: ${channel}!\n` +
                     `📋 Leia as regras e comece a pagar suas punições.`,
            ephemeral: true
        });

        // Log no canal #logs
        if (client.logger) {
            await client.logger.discord(
                '🏗️ Canal Temporário Criado',
                `**Usuário:** ${user.tag} (${user.id})\n` +
                `**Canal:** ${channel.name} (${channel.id})\n` +
                `**Punições a Pagar:** ${userData.punicoes}\n` +
                `**Progresso Inicial:** 0/${userData.punicoes}\n` +
                `**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                'info'
            );
        }

        console.log(`✅ ${user.tag} iniciou pagamento de ${userData.punicoes} punições`);

    } catch (error) {
        console.error('❌ Erro ao iniciar pagamento:', error);

        await interaction.editReply({
            content: '❌ Ocorreu um erro ao criar o canal de pagamento. Tente novamente mais tarde.',
            ephemeral: true
        });

        if (client.logger) {
            client.logger.error('Erro ao iniciar pagamento', error, true);
        }
    }
}
