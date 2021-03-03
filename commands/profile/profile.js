module.exports = {
    name: 'profile',
    aliases: [],
    category: 'Profile',
    utilisation: '{prefix}profile <@user>',
    description: 'Obtain profile information.',

    async execute(client, message) {
        const { MessageEmbed } = require("discord.js");
        
        let profileUser = message.author;
        let avatarUser = profileUser.avatarURL();

        if (message.mentions.members.first()) {
            profileUser =  message.mentions.members.first();
            avatarUser = profileUser.user.avatarURL();
        }

        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, profileUser.id);
        let id = profileUser.id;

        const pad = (num) => { 
            return ('00'+num).slice(-2) 
        };
        
        let date = new Date();
        date = new Date(date.toLocaleString('en-US', {timezone: 'PST'}));
        date.setHours(date.getHours() - 5);

        date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

        let retrieveDamage = require('../../database/retrieveDatabase/retrieveDamage');
        let profileDamage = await retrieveDamage(client, id, date);

        const randomStatus = Math.floor(Math.random() * 5);
        const statusStrings = [
            `A Dapper Fellow ${client.emotes.nozomiCoolEmoji}`,
            `Empty In Mana ${client.emotes.manaEmoji}`,
            `Drowning In Amulets ${client.emotes.amuletEmoji}`,
            `Pulling Literal Garbage ${client.emotes.oneStarEmoji}`,
            `Out Of Shape ${client.emotes.staminaEmoji}`
        ];

        let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');
        let currentCB = getClanBattleId(new Date());
        let cbDmgTitle = `This Clan Battle ${client.emotes.blueSwordEmoji} `;
        let cbDmgValue = profileDamage[0];

        let todayDmgTitle = `Dealt Today ${client.emotes.greenSwordEmoji} `
        let todayDmgValue = profileDamage[1];

        if (currentCB == -1) {
            cbDmgTitle = `Not In Battle ${client.emotes.blueSwordEmoji}`;
            cbDmgValue = `N/A`;

            todayDmgTitle = `Not In Battle ${client.emotes.greenSwordEmoji}`;
            todayDmgValue = `N/A`;
        }

        await message.channel.send(new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
            .setDescription(statusStrings[randomStatus])
            .addField(`Level ${client.emotes.starLevelEmoji}`, client.userData[id].level)
            .addFields(
                { name: cbDmgTitle, value: cbDmgValue, inline: true },
                { name: todayDmgTitle, value: todayDmgValue, inline: true },
                { name: `Total Dealt ${client.emotes.swordEmoji}`, value: profileDamage[2], inline: true },
                { name: `Jewels ${client.emotes.jewelEmoji} `, value: client.userData[id].jewels, inline: true },
                { name: `Amulets ${client.emotes.amuletEmoji}`, value: client.userData[id].amulets, inline: true },
            )
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp());
    },
};