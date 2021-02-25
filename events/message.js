module.exports = async (client, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    let addXp = require('../helper/profile/addXp');
    console.log(client.userdata);
    await addXp(client, message);

    const prefix = client.config.discord.prefix;

    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    if (cmd) cmd.execute(client, message, args, data);
};