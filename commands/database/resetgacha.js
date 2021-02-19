module.exports = {
    name: 'reset',
    aliases: [],
    category: 'Database',
    utilisation: '{prefix}reset',

    async execute(client, message) {
        if (message.author.id == 154775062178824192) {
            await initCharDB();

            // Initialize
            await initGacha();
            await updateGacha();

            isResetGacha = true;
            console.log(`LOG: CharDB have been reset by ${message.author.username} (${message.author.id})`);
        } else {
            console.log(`LOG: Failed attempt to reset CharDB by ${message.author.username} (${message.author.id})`);
        }
    },
}