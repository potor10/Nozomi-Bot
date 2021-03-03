module.exports = {
    name: 'resetstats',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetstats',
    description: 'Reset user stats database',

    async execute(client, message) {
        if (message.author.id == client.config.admin) {

            let initStats = require('../../database/updateDatabase/initStats');
            await initStats();

            // Initialize
            let initAllObj = require('../../database/updateObject/initAllObj');
            await initAllObj(client);

            console.log(`LOG: Stats have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset stats by ${message.author.username} (${message.author.id})`);
        }
    },
};