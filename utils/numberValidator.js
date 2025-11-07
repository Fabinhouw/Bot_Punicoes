/**
 * Números por extenso válidos para o sistema de pagamento de punições
 */
const NUMEROS_EXTENSO = {
    1: 'UM',
    2: 'DOIS',
    3: 'TRÊS',
    4: 'QUATRO',
    5: 'CINCO',
    6: 'SEIS',
    7: 'SETE',
    8: 'OITO',
    9: 'NOVE',
    10: 'DEZ',
    11: 'ONZE',
    12: 'DOZE',
    13: 'TREZE',
    14: 'QUATORZE',
    15: 'QUINZE',
    16: 'DEZESSEIS',
    17: 'DEZESSETE',
    18: 'DEZOITO',
    19: 'DEZENOVE',
    20: 'VINTE'
};

// Criar mapa reverso (extenso -> número)
const EXTENSO_PARA_NUMERO = {};
for (const [num, extenso] of Object.entries(NUMEROS_EXTENSO)) {
    EXTENSO_PARA_NUMERO[extenso] = parseInt(num);
}

/**
 * Valida se a mensagem está no formato correto: NÚMERO!
 * Exemplo: UM!, DOIS!, TRÊS!
 * 
 * @param {string} mensagem - Mensagem a ser validada
 * @returns {object} { valido: boolean, numero: number|null, erro: string|null }
 */
function validarMensagem(mensagem) {
    // Remover espaços extras
    const msg = mensagem.trim();

    // Verificar se termina com !
    if (!msg.endsWith('!')) {
        return {
            valido: false,
            numero: null,
            erro: 'Mensagem não termina com ponto de exclamação (!)'
        };
    }

    // Remover o ! e pegar o número por extenso
    const numeroExtenso = msg.slice(0, -1).trim().toUpperCase();

    // Verificar se é um número válido
    if (!EXTENSO_PARA_NUMERO.hasOwnProperty(numeroExtenso)) {
        return {
            valido: false,
            numero: null,
            erro: `"${numeroExtenso}" não é um número válido por extenso`
        };
    }

    return {
        valido: true,
        numero: EXTENSO_PARA_NUMERO[numeroExtenso],
        erro: null
    };
}

/**
 * Verifica se o número enviado é o próximo esperado na sequência
 * 
 * @param {number} numeroEnviado - Número que o usuário enviou
 * @param {number} progressoAtual - Progresso atual do usuário
 * @returns {boolean}
 */
function isProximoNumero(numeroEnviado, progressoAtual) {
    return numeroEnviado === progressoAtual + 1;
}

/**
 * Converte número para extenso
 * 
 * @param {number} numero - Número a converter
 * @returns {string} Número por extenso em maiúsculas
 */
function numeroParaExtenso(numero) {
    return NUMEROS_EXTENSO[numero] || numero.toString();
}

/**
 * Gera lista de exemplos de números válidos
 * 
 * @param {number} quantidade - Quantidade de exemplos
 * @returns {string} String formatada com exemplos
 */
function gerarExemplos(quantidade = 5) {
    const exemplos = [];
    for (let i = 1; i <= Math.min(quantidade, 20); i++) {
        exemplos.push(`${NUMEROS_EXTENSO[i]}!`);
    }
    return exemplos.join(', ');
}

/**
 * Retorna a mensagem esperada formatada para um número específico
 * 
 * @param {number} numero - Número esperado
 * @returns {string} Mensagem formatada
 */
function getMensagemEsperada(numero) {
    const extenso = numeroParaExtenso(numero);
    return `${extenso}!`;
}

module.exports = {
    validarMensagem,
    isProximoNumero,
    numeroParaExtenso,
    gerarExemplos,
    getMensagemEsperada,
    NUMEROS_EXTENSO
};
