module.exports = {
    name: 'ping',
    aliases: [],
    category: 'Core',
    utilisation: '{prefix}say',

    execute(client, message, args) {
        const sayMessage = args.join(" ");
        message.deletable ? message.delete() : console.log(`Looks like I can't delete ` + 
                                                           `message in ${message.channel.name}`);
        await message.channel.send(sayMessage);
    },
};