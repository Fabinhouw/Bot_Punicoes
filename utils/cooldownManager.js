/**
 * Sistema de cooldown para bloqueio temporário de usuários
 */

// Set para armazenar usuários em cooldown
const cooldowns = new Set();

/**
 * Adiciona um usuário ao cooldown
 * @param {string} userId - ID do usuário
 * @param {number} duration - Duração em milissegundos (padrão: 3000ms = 3s)
 */
function addCooldown(userId, duration = 3000) {
    cooldowns.add(userId);
    
    setTimeout(() => {
        cooldowns.delete(userId);
    }, duration);
}

/**
 * Verifica se um usuário está em cooldown
 * @param {string} userId - ID do usuário
 * @returns {boolean}
 */
function isInCooldown(userId) {
    return cooldowns.has(userId);
}

/**
 * Remove um usuário do cooldown manualmente
 * @param {string} userId - ID do usuário
 */
function removeCooldown(userId) {
    cooldowns.delete(userId);
}

/**
 * Limpa todos os cooldowns
 */
function clearAllCooldowns() {
    cooldowns.clear();
}

/**
 * Retorna quantidade de usuários em cooldown
 * @returns {number}
 */
function getCooldownCount() {
    return cooldowns.size;
}

module.exports = {
    addCooldown,
    isInCooldown,
    removeCooldown,
    clearAllCooldowns,
    getCooldownCount
};
