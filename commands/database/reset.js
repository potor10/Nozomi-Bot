module.exports = {
    name: 'reset',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}reset',
    description: 'Reset all databases but gacha',

    async execute(client, message) {
        if (message.author.id == client.config.admin) {

            let initAll = require('../../database/updateDatabase/initAll');
            await initAll();

            // Initialize
            let initAllObj = require('../../database/updateObject/initAllObj');
            await initAllObj(client);

            console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset users by ${message.author.username} (${message.author.id})`);
        }
    },
};