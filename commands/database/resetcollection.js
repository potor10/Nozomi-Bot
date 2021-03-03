module.exports = {
    name: 'resetcollection',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetcollection',
    description: 'Reset collection database',
    adminonly: true,

    async execute(client, message) {
        let initCollection = require('../../database/updateDatabase/initCollection');
        await initCollection();

        // Initialize
        let initAllObj = require('../../database/updateObject/initAllObj');
        await initAllObj(client);

        console.log(`LOG: Collection has been reset by ${message.author.username} (${message.author.id})`);
    },
};