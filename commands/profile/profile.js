module.exports = {
    name: 'profile',
    aliases: [],
    category: 'Profile',
    utilisation: '{prefix}profile',

    async execute(client, message) {
        let profileUser = message.author;
        let avatarUser = profileUser.avatarURL();
        if (message.mentions.members.first()) {
            profileUser =  message.mentions.members.first();
            avatarUser = profileUser.user.avatarURL();
        }

        createUserIfNotExist(profileUser.id);
        let id = profileUser.id;

        const pad = (num) => { 
            return ('00'+num).slice(-2) 
        };
        
        let date = new Date();
        date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

        let profileDamage = await retrieveDamageDB(id, date);

        const randomStatus = Math.floor(Math.random() * 5);
        const statusStrings = [
            `A Dapper Fellow ${nozomiCoolEmoji}`,
            `Empty In Mana ${manaEmoji}`,
            `Drowning In Amulets ${amuletEmoji}`,
            `Pulling Literal Garbage ${oneStarEmoji}`,
            `Out Of Shape ${staminaEmoji}`
        ];

        await message.channel.send(new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
            .setDescription(statusStrings[randomStatus])
            .addField(`Level ${starLevelEmoji}`, userData[id].level)
            .addFields(
                { name: `Dealt This Month ${blueSwordEmoji} `, value: profileDamage[0], inline: true },
                { name: `Dealt Today ${greenSwordEmoji} `, value: profileDamage[1], inline: true },
                { name: `Total Dealt ${swordEmoji}`, value: profileDamage[2], inline: true },
                { name: `Jewels ${jewelEmoji} `, value: userData[id].jewels, inline: true },
                { name: `Amulets ${amuletEmoji}`, value: userData[id].amulets, inline: true },
            )
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp());
    },
};