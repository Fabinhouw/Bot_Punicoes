require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        logsChannelId: process.env.LOGS_CHANNEL_ID || null,
        muralChannelId: process.env.MURAL_CHANNEL_ID || null,
        roles: {
            admin: process.env.ADMIN_ROLE_ID ? process.env.ADMIN_ROLE_ID.split(',').map(id => id.trim()) : [],
            oficial: process.env.OFICIAL_ROLE_ID ? process.env.OFICIAL_ROLE_ID.split(',').map(id => id.trim()) : []
        }
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'bot_punicao'
    }
};
