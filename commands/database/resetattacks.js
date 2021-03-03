module.exports = {
    name: 'resetattacks',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetattacks',
    description: 'Reset attack database',
    adminonly: true,

    async execute(client, message) {
        let initAttacks = require('../../database/updateDatabase/initAttacks');
        await initAttacks();

        console.log(`LOG: Attacks DB have been reset by ${message.author.username} (${message.author.id})`);
    },
};