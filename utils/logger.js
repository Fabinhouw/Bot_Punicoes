const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const { query } = require('../database/connection');

/**
 * Sistema de logs do bot
 */
class Logger {
    constructor(client) {
        this.client = client;
        this.logsChannelId = config.discord.logsChannelId;
    }

    /**
     * Envia log para o console
     */
    console(message, type = 'info') {
        const timestamp = new Date().toLocaleString('pt-BR');
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            debug: '🔍'
        }[type] || 'ℹ️';

        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    /**
     * Salva log no banco de dados
     */
    async database(tipo, titulo, descricao, usuarioId = null, usuarioTag = null, nivel = 'info') {
        try {
            await query(
                `INSERT INTO logs (tipo, titulo, descricao, usuario_id, usuario_tag, nivel) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [tipo, titulo, descricao, usuarioId, usuarioTag, nivel]
            );
        } catch (error) {
            console.error('❌ Erro ao salvar log no banco:', error.message);
        }
    }

    /**
     * Envia log para o canal #logs do Discord
     */
    async discord(title, description, type = 'info', usuarioId = null, usuarioTag = null) {
        // Salvar no banco de dados
        await this.database(
            title.split(' ')[0], // Tipo (primeiro emoji/palavra)
            title,
            description,
            usuarioId,
            usuarioTag,
            type
        );

        if (!this.logsChannelId || !this.client.isReady()) {
            return;
        }

        try {
            const channel = await this.client.channels.fetch(this.logsChannelId);
            if (!channel || !channel.isTextBased()) {
                return;
            }

            const colors = {
                info: 0x3498db,      // Azul
                success: 0x2ecc71,   // Verde
                error: 0xe74c3c,     // Vermelho
                warning: 0xf39c12,   // Amarelo
                debug: 0x95a5a6      // Cinza
            };

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(colors[type] || colors.info)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log para o Discord:', error.message);
        }
    }

    /**
     * Log de informação
     */
    info(message, sendToDiscord = false, discordTitle = '') {
        this.console(message, 'info');
        if (sendToDiscord) {
            this.discord(discordTitle || 'Informação', message, 'info');
        }
    }

    /**
     * Log de sucesso
     */
    success(message, sendToDiscord = false, discordTitle = '') {
        this.console(message, 'success');
        if (sendToDiscord) {
            this.discord(discordTitle || 'Sucesso', message, 'success');
        }
    }

    /**
     * Log de erro
     */
    error(message, error = null, sendToDiscord = false, discordTitle = '') {
        const fullMessage = error ? `${message}\n${error.stack || error.message}` : message;
        this.console(fullMessage, 'error');
        if (sendToDiscord) {
            this.discord(discordTitle || 'Erro', fullMessage, 'error');
        }
    }

    /**
     * Log de aviso
     */
    warning(message, sendToDiscord = false, discordTitle = '') {
        this.console(message, 'warning');
        if (sendToDiscord) {
            this.discord(discordTitle || 'Aviso', message, 'warning');
        }
    }

    /**
     * Log de debug
     */
    debug(message) {
        this.console(message, 'debug');
    }
}

module.exports = Logger;
