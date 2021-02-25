module.exports = {
    name: 'daily',
    aliases: [],
    category: 'Profile',
    utilisation: '{prefix}daily',

    async execute(client, message) {
        const { MessageEmbed } = require("discord.js");
        
        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, message.author.id);

        let bonusGems = (client.userData[message.author.id].level - 1) * Math.floor((Math.random() * 5) + 1) * 10;
        let dailyGems = 1500 + bonusGems;

        let startofDay = new Date();
        startofDay.setUTCHours(0,0,0,0);

        let startofTomorrow = new Date();
        startofTomorrow.setDate(startofTomorrow.getUTCDate() + 1);
        startofTomorrow.setUTCHours(0,0,0,0);

        let currentTime = new Date();

        let timeBefore = Math.floor((startofTomorrow.getTime() - currentTime.getTime()) / 3600000);

        if (startofDay > client.userData[message.author.id].lastclaim) {
            console.log(`LOG: ${message.author.username} claimed on ${startofDay}`);
            client.userData[message.author.id].lastclaim = startofDay;
            client.userData[message.author.id].jewels += dailyGems;

            await message.channel.send(new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`Success! You Have Claimed ${dailyGems} ${client.emotes.jewelEmoji} Today`)
                .setDescription(`(${bonusGems} ${client.emotes.jewelEmoji} bonus for being level ${client.userData[message.author.id].level})`)
                .addField(`\u200B`, `Come Back In ${timeBefore} Hours To Claim Again`)
                .setFooter(client.config.discord.footerText, client.user.avatarURL())
                .setTimestamp());
        } else {
            await message.channel.send(new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`Oof out of ${client.emotes.staminaEmoji}`)
                .setDescription(`You Have Already Claimed Today`)
                .addField(`\u200B`, `Come Back In ${timeBefore} Hours To Claim Again`)
                .setFooter(client.config.discord.footerText, client.user.avatarURL())
                .setTimestamp());
        }

    },
};