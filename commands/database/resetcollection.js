module.exports = {
    name: 'resetcollection',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetcollection',
    description: 'Reset collection database',

    async execute(client, message) {
        if (message.author.id == client.config.admin) {

            let initCollection = require('../../database/updateDatabase/initCollection');
            await initCollection();

            // Initialize
            let initAllObj = require('../../database/updateObject/initAllObj');
            await initAllObj(client);

            console.log(`LOG: Collection has been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset collection by ${message.author.username} (${message.author.id})`);
        }
    },
};