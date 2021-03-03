module.exports = async (client) => {
    console.log(`LOG: I have been removed from: ${guild.name} (id: ${guild.id})`);

    client.user.setActivity(`${client.config.discord.prefix}help : Nozomi Bot On ${client.guilds.cache.size} Servers`);
};