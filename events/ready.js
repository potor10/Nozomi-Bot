module.exports = async (client) => {
    console.log(`LOG: Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`);

    client.user.setActivity(`${client.config.discord.prefix}help : Nozomi Bot On ${client.guilds.cache.size} Servers`);
};