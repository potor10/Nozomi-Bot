module.exports = {
    name: 'resetgacha',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}reset',

    async execute(client, message) {
        if (message.author.id == 154775062178824192) {
            let initChar = require('../../database/updateDatabase/initChar');
            await initChar();

            // Initialize
            let initGachaObj = require('../../database/updateObject/initGachaObj');
            await initGachaObj();

            let updateGacha = require('../../helper/gacha/updateGacha');
            await updateGacha(client);

            isResetGacha = true;
            console.log(`LOG: CharDB have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset CharDB by ${message.author.username} (${message.author.id})`);
        }
    },
}