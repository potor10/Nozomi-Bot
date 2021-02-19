module.exports = async (client) => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);

    client.user.setActivity(`${client.config.discord.prefix}help : Nozomi Bot On ${client.guilds.cache.size} Servers`);
};