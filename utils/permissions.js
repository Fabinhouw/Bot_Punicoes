const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');

/**
 * Verifica se o membro tem permissão de administrador
 * Verifica tanto a permissão do Discord quanto os cargos configurados
 * @param {GuildMember} member - Membro do servidor
 * @returns {boolean}
 */
function isAdmin(member) {
    if (!member) return false;
    
    // Verificar se tem permissão de Administrator do Discord
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }
    
    // Verificar se tem algum dos cargos de Admin configurados
    const adminRoles = config.discord.roles.admin;
    if (adminRoles.length > 0) {
        return member.roles.cache.some(role => adminRoles.includes(role.id));
    }
    
    return false;
}

/**
 * Verifica se o membro tem permissão de moderação (Admin ou Oficial)
 * @param {GuildMember} member - Membro do servidor
 * @returns {boolean}
 */
function isModerator(member) {
    if (!member) return false;
    
    // Se é admin, já é moderador
    if (isAdmin(member)) {
        return true;
    }
    
    // Verificar se tem algum dos cargos de Oficial configurados
    const oficialRoles = config.discord.roles.oficial;
    if (oficialRoles.length > 0) {
        return member.roles.cache.some(role => oficialRoles.includes(role.id));
    }
    
    return false;
}

/**
 * Obtém o nível de permissão do membro
 * @param {GuildMember} member - Membro do servidor
 * @returns {string} 'admin', 'moderator', ou 'user'
 */
function getPermissionLevel(member) {
    if (isAdmin(member)) return 'admin';
    if (isModerator(member)) return 'moderator';
    return 'user';
}

/**
 * Responde com mensagem de falta de permissão
 * @param {CommandInteraction} interaction - Interação do comando
 * @param {string} requiredLevel - Nível necessário ('admin' ou 'moderator')
 */
async function replyNoPermission(interaction, requiredLevel = 'admin') {
    const messages = {
        admin: '❌ Você não tem permissão para usar este comando! Apenas **Administradores** podem executá-lo.',
        moderator: '❌ Você não tem permissão para usar este comando! Apenas **Administradores** e **Oficiais** podem executá-lo.'
    };
    
    return await interaction.reply({
        content: messages[requiredLevel] || messages.admin,
        ephemeral: true
    });
}

/**
 * Obtém lista de cargos de moderação do membro
 * @param {GuildMember} member - Membro do servidor
 * @returns {Array<string>} Lista de nomes dos cargos
 */
function getModeratorRoles(member) {
    if (!member) return [];
    
    const roles = [];
    const adminRoles = config.discord.roles.admin;
    const oficialRoles = config.discord.roles.oficial;
    
    member.roles.cache.forEach(role => {
        if (adminRoles.includes(role.id)) {
            roles.push(`Admin: ${role.name}`);
        } else if (oficialRoles.includes(role.id)) {
            roles.push(`Oficial: ${role.name}`);
        }
    });
    
    return roles;
}

module.exports = {
    isAdmin,
    isModerator,
    getPermissionLevel,
    replyNoPermission,
    getModeratorRoles
};
