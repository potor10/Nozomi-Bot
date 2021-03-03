module.exports = {
    name: 'reset',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}reset',
    description: 'Reset all databases but gacha',
    adminonly: true,

    async execute(client, message) {
        let initAll = require('../../database/updateDatabase/initAll');
        await initAll();

        // Initialize
        let initAllObj = require('../../database/updateObject/initAllObj');
        await initAllObj(client);

        console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
    },
};