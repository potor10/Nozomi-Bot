module.exports = {
    name: 'reset',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}reset',

    async execute(client, message) {
        if (message.author.id == 154775062178824192) {

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