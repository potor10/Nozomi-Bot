module.exports = {
    name: 'resetgacha',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}resetgacha',
    description: 'Reset gacha database',

    async execute(client, message) {
        if (message.author.id == client.config.admin) {
            let initChar = require('../../database/updateDatabase/initChar');
            await initChar();

            // Initialize
            let initGachaObj = require('../../database/updateObject/initGachaObj');
            await initGachaObj(client);

            let updateGacha = require('../../helper/gacha/updateGacha');
            await updateGacha(client);

            client.isResetGacha = true;
            console.log(`LOG: CharDB have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset CharDB by ${message.author.username} (${message.author.id})`);
        }
    },
}