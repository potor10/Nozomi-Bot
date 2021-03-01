module.exports = async (client) => {
    console.log(`LOG: New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

    client.user.setActivity(`${client.config.discord.prefix}help : Nozomi Bot On ${client.guilds.cache.size} Servers`);
};