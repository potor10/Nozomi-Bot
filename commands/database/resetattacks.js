module.exports = {
    name: 'resetattacks',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetattacks',

    async execute(client, message) {
        if (message.author.id == client.config.admin) {

            let initAttacks = require('../../database/updateDatabase/initAttacks');
            await initAttacks();

            console.log(`LOG: Attacks DB have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset attacks by ${message.author.username} (${message.author.id})`);
        }
    },
};