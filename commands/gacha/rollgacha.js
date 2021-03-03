module.exports = {
    name: 'rollgacha',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}rollgacha',
    description: 'Plays the Gacha.',
    adminonly: false,

    async execute(client, message) {
        const { MessageEmbed } = require("discord.js");
        
        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, message.author.id);
        let id = message.author.id;

        const jewelCost = 1500;

        let pullGacha = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`Rolling x10 On This Gacha Will Cost **${jewelCost}** ${client.emotes.jewelEmoji}`)
            .setDescription(`React To Confirm`)
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();
        
        let cancelGacha = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`The Roll Has Been Cancelled.`)
            .setDescription(`You Have Timed Out`)
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();

        let emojiText = await message.channel.send(pullGacha);

        let awaitEmoji = require('../../helper/discord/awaitEmoji');
        let collected = await awaitEmoji(client, message, emojiText,
            client.emotes.jewelEmojiId, { max: 1, time: 20000, errors: ['time'] }, 
            cancelGacha);

        if (!collected) return;
        let reaction = collected.first();

        if (reaction.emoji.id === client.emotes.jewelEmojiId) {
            if (client.userData[id].jewels >= jewelCost && !client.userData[id].inroll) {
                // Deduct the jewels immediately
                client.userData[id].jewels -= jewelCost;
                client.userData[id].inroll = true;

                await emojiText.delete();

                let has3Star = false;
                
                let silverCount = 0;
                let amuletsObtained = 0;
                let newUnits = 0;

                let obtainedImages = [];
                let isDupe = [];

                let getRolledCharData = require('../../helper/gacha/getRolledCharData');

                for (let i = 0; i < 10; i++) {
                    const rarityRolled = Math.floor(Math.random() * 
                        (client.gacha.oneStarRate + client.gacha.twoStarRate + client.gacha.threeStarRate));

                    if (rarityRolled < client.gacha.threeStarRate) {
                        has3Star = true;
                        let rollImgData = await getRolledCharData(client, id, 3);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }

                        amuletsObtained += rollImgData[2];
                    } else if (rarityRolled < (client.gacha.threeStarRate + client.gacha.twoStarRate) || silverCount == 9) {
                        let rollImgData = await getRolledCharData(client, id, 2);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }
                        
                        amuletsObtained += rollImgData[2];
                    } else {
                        silverCount++;
                        let rollImgData = await getRolledCharData(client, id, 1);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }
                        
                        amuletsObtained += rollImgData[2];
                    }
                    embedRoll.setDescription(`${rollString}`);                    
                } 

                let embedRoll = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setDescription(``)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();

                if (has3Star) {
                    const gachaStrings = [
                        `Is it a 3 Star? ${client.emotes.threeStarEmoji}`,
                        `Lucksack ${client.emotes.starLevelEmoji}`,
                        `Probably Another Dupe ${client.emotes.amuletEmoji}`,
                        `${client.emotes.nozomiBlushEmoji}`,
                    ];
                    const randomGachaString = Math.floor(Math.random() * gachaStrings.length);
                    
                    embedRoll.attachFiles([`./img/entry_lucky.gif`])
                        .setImage('attachment://entry_lucky.gif')
                        .setDescription(`${gachaStrings[randomGachaString]}`);
                } else {
                    const gachaStrings = [
                        `Nice Trash ${client.emotes.nozomiCoolEmoji}`,
                        `At Least There Is One ${client.emotes.twoStarEmoji}`,
                        `It's All Garbage ${client.emotes.oneStarEmoji}`,
                        `Jewels In The Toilet ${client.emotes.jewelEmoji}`
                    ];
                    const randomGachaString = Math.floor(Math.random() * gachaStrings.length);

                    embedRoll.attachFiles([`./img/entry_unlucky.gif`])
                        .setImage('attachment://entry_unlucky.gif')
                        .setDescription(`${gachaStrings[randomGachaString]}`);
                }

                client.userData[id].amulets += amuletsObtained;

                let createImage = require('../../helper/gacha/createImage');
                await createImage(client, message, obtainedImages, isDupe);

                let amuletStr = `You have earned ${amuletsObtained} ${client.emotes.amuletEmoji}`;

                if (newUnits > 0) {
                    amuletStr += ` and have obtained ${newUnits} new characters!`
                }

                let combinedRoll = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                    .setDescription(amuletStr)
                    .attachFiles([`./gacharoll${message.author.id}.png`])
                    .setImage(`attachment://gacharoll${message.author.id}.png`)
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();

                await message.channel.send(embedRoll);
                setTimeout(async () => { 
                    await embedRoll.delete();
                    await message.channel.send(combinedRoll);
                    client.userData[message.author.id].inroll = false;
                }, 6640);
            } else {
                if (client.userData[id].inroll) {
                    let reminder = new MessageEmbed()
                        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                        .setAuthor(client.user.username, client.user.avatarURL())
                        .setTitle(`You Are Currently Doing A x10 Roll!`)
                        .setDescription(`Please Wait Until The Roll Is Finished Before Trying Again`)
                        .setFooter(client.config.discord.footerText, client.user.avatarURL())
                        .setTimestamp();
                    await emojiText.edit(reminder);
                } else {
                    let reminder = new MessageEmbed()
                        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                        .setAuthor(client.user.username, client.user.avatarURL())
                        .setTitle(`You Need At Least ${jewelCost} ${client.emotes.jewelEmoji} To Roll!`)
                        .setDescription(`You Are Missing ${jewelCost-client.userData[id].jewels} ${client.emotes.jewelEmoji}`)
                        .setFooter(client.config.discord.footerText, client.user.avatarURL())
                        .setTimestamp();
                    await emojiText.edit(reminder);
                }
                setTimeout(() => { emojiText.delete();}, 5000);
            }
        }
    },
};