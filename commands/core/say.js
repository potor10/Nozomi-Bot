module.exports = {
    name: 'say',
    aliases: [],
    category: 'Core',
    utilisation: '{prefix}say',

    async execute(client, message, args) {
        const sayMessage = args.join(" ");
        message.deletable ? message.delete() : console.log(`Looks like I can't delete ` + 
                                                           `message in ${message.channel.name}`);
        await message.channel.send(sayMessage);
    },
};