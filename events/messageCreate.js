const { Events, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, updateUser } = require('../database/setup');
const { validarMensagem, isProximoNumero, numeroParaExtenso, getMensagemEsperada } = require('../utils/numberValidator');
const { enviarProgresso, fecharCanal } = require('../utils/channelManager');
const { atualizarMural } = require('../utils/muralManager');
const { addCooldown, isInCooldown } = require('../utils/cooldownManager');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Ignorar mensagens de bots
        if (message.author.bot) return;

        // Verificar se o canal é um canal de pagamento
        if (!message.channel.name || !message.channel.name.startsWith('pagamento-')) {
            return;
        }

        try {
            const user = message.author;
            const userData = await getOrCreateUser(user.id);

            // Verificar se o usuário está pagando punição
            if (!userData.pagando) {
                return;
            }

            // Verificar se o usuário está em cooldown (bloqueado temporariamente)
            if (isInCooldown(user.id)) {
                await message.delete().catch(() => {});
                return;
            }

            // Validar a mensagem
            const validacao = validarMensagem(message.content);

            if (!validacao.valido) {
                // Incrementar contador de erros no banco
                await updateUser(user.id, {
                    erros: userData.erros + 1
                });

                // Mensagem esperada
                const numeroEsperado = userData.progresso + 1;
                const mensagemEsperada = getMensagemEsperada(numeroEsperado);

                // Criar embed de alerta
                const alertEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Alerta de Punição Errônea')
                    .setDescription(
                        `<@${user.id}>, você errou na realização da sua punição.\n\n` +
                        `**Mensagem esperada:**\n\n` +
                        `${mensagemEsperada} ✅\n\n` +
                        `Corrija para prosseguir.` +
                        `\n\n` +
                        `Espera 3 segundos para tentar novamente!`
                    )
                    .setColor(0xFFA500)
                    .setTimestamp();

                // Enviar alerta e deletar após 5 segundos
                const alertMsg = await message.channel.send({ embeds: [alertEmbed] });
                setTimeout(() => {
                    alertMsg.delete().catch(() => {});
                }, 5000);

                // Deletar mensagem incorreta
                await message.delete().catch(() => {});

                // Adicionar usuário ao cooldown (bloqueio de 3 segundos)
                addCooldown(user.id, 3000);

                // Log no canal #logs
                if (client.logger) {
                    await client.logger.discord(
                        '⚠️ [ERRO DE PUNIÇÃO]',
                        `**Usuário:** ${user.tag} (${user.id})\n` +
                        `**Canal:** ${message.channel.name}\n` +
                        `**Mensagem Enviada:** \`${message.content}\`\n` +
                        `**Mensagem Esperada:** \`${mensagemEsperada}\`\n` +
                        `**Erro:** ${validacao.erro}\n` +
                        `**Progresso:** ${userData.progresso}/${userData.punicoes}\n` +
                        `**Total de Erros:** ${userData.erros + 1}\n` +
                        `**Bloqueio:** 3 segundos`,
                        'warning',
                        user.id,
                        user.tag
                    );
                }

                console.log(`⚠️ ${user.tag} errou o formato: ${message.content} (Bloqueado por 3s)`);
                return;
            }

            // Verificar se é o próximo número na sequência
            if (!isProximoNumero(validacao.numero, userData.progresso)) {
                // Incrementar contador de erros no banco
                await updateUser(user.id, {
                    erros: userData.erros + 1
                });

                const numeroEsperado = userData.progresso + 1;
                const mensagemEsperada = getMensagemEsperada(numeroEsperado);

                // Criar embed de alerta
                const alertEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Alerta de Punição Errônea')
                    .setDescription(
                        `<@${user.id}>, você errou na realização da sua punição.\n\n` +
                        `**Mensagem esperada:**\n\n` +
                        `${mensagemEsperada} ✅\n\n` +
                        `Corrija para prosseguir.`
                    )
                    .setColor(0xFFA500)
                    .setTimestamp();

                // Enviar alerta e deletar após 5 segundos
                const alertMsg = await message.channel.send({ embeds: [alertEmbed] });
                setTimeout(() => {
                    alertMsg.delete().catch(() => {});
                }, 5000);

                // Deletar mensagem incorreta
                await message.delete().catch(() => {});

                // Adicionar usuário ao cooldown (bloqueio de 3 segundos)
                addCooldown(user.id, 3000);

                // Log no canal #logs
                if (client.logger) {
                    await client.logger.discord(
                        '⚠️ [ERRO DE PUNIÇÃO]',
                        `**Usuário:** ${user.tag} (${user.id})\n` +
                        `**Canal:** ${message.channel.name}\n` +
                        `**Enviou:** ${numeroParaExtenso(validacao.numero)}\n` +
                        `**Esperado:** ${mensagemEsperada}\n` +
                        `**Progresso:** ${userData.progresso}/${userData.punicoes}\n` +
                        `**Total de Erros:** ${userData.erros + 1}\n` +
                        `**Bloqueio:** 3 segundos`,
                        'warning',
                        user.id,
                        user.tag
                    );
                }

                console.log(`⚠️ ${user.tag} enviou sequência errada: ${numeroParaExtenso(validacao.numero)} (esperado: ${mensagemEsperada})`);
                return;
            }

            // Mensagem válida! Incrementar progresso
            const novoProgresso = userData.progresso + 1;
            await updateUser(user.id, {
                progresso: novoProgresso
            });

            // Reagir com sucesso
            await message.react('✅');

            // Verificar se completou todas as punições
            if (novoProgresso >= userData.punicoes) {
                // COMPLETOU! Zerar punições e status
                await updateUser(user.id, {
                    punicoes: 0,
                    pagando: false,
                    progresso: 0
                });

                // Log no canal #logs
                if (client.logger) {
                    await client.logger.discord(
                        '🎉 Punição Completada',
                        `**Usuário:** ${user.tag} (${user.id})\n` +
                        `**Total Pago:** ${userData.punicoes} polichinelo(s)\n` +
                        `**Canal:** ${message.channel.name}\n` +
                        `**Status:** ✅ Todas as punições foram quitadas!`,
                        'success'
                    );
                }

                console.log(`🎉 ${user.tag} completou ${userData.punicoes} punições!`);

                // Atualizar mural de punições
                await atualizarMural(client);

                // Log de exclusão de canal
                const channelName = message.channel.name;
                const channelId = message.channel.id;
                
                // Fechar o canal
                await fecharCanal(message.channel, user, 10);
                
                // Log adicional de exclusão (após 10 segundos)
                setTimeout(async () => {
                    if (client.logger) {
                        await client.logger.discord(
                            '🗑️ Canal Temporário Excluído',
                            `**Usuário:** ${user.tag} (${user.id})\n` +
                            `**Canal:** ${channelName} (${channelId})\n` +
                            `**Motivo:** Pagamento concluído\n` +
                            `**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                            'info'
                        );
                    }
                }, 11000); // 11 segundos (1 segundo após deletar)

            } else {
                // Ainda tem mais - enviar progresso a cada 10 ou em marcos importantes
                if (novoProgresso % 10 === 0 || novoProgresso === 1 || novoProgresso === userData.punicoes - 1) {
                    await enviarProgresso(message.channel, novoProgresso, userData.punicoes);
                }

                // Mensagem de incentivo em marcos
                if (novoProgresso === Math.floor(userData.punicoes / 2)) {
                    await message.channel.send('💪 **Metade concluída! Continue assim!**');
                } else if (novoProgresso === userData.punicoes - 10 && userData.punicoes > 10) {
                    await message.channel.send('🔥 **Últimos 10! Você consegue!**');
                } else if (novoProgresso === userData.punicoes - 1) {
                    await message.channel.send('🎯 **Último! Quase lá!**');
                }
            }

        } catch (error) {
            console.error('❌ Erro ao processar mensagem de pagamento:', error);
            
            if (client.logger) {
                client.logger.error('Erro no processamento de pagamento', error, true);
            }
        }
    },
};
