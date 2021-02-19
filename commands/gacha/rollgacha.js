module.exports = {
    name: 'rollgacha',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}rollgacha',

    async execute(client, message) {
        createUserIfNotExist(message.author.id);
        let id = message.author.id;

        const jewelCost = 1500;

        let pullGacha = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`Rolling x10 On This Gacha Will Cost **${jewelCost}** ${jewelEmoji}`)
            .setDescription(`React To Confirm`)
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp();

        let collected = await awaitEmoji(message, pullGacha,
            JEWEL_EMOJI, { max: 1, time: 20000, errors: ['time'] }, 
            'The Roll Has Been Cancelled.');

        if (!collected) return;
        let reaction = collected.first();

        if (reaction.emoji.id === JEWEL_EMOJI) {
            if (userData[id].jewels >= jewelCost && !userData[id].inroll) {
                // Deduct the jewels immediately
                userData[id].jewels -= jewelCost;
                userData[id].inroll = true;

                const pulledChars = [];
                let rollString = '';

                let embedRoll = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                    .setDescription(`${rollString}`)
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();

                let rollResults = await message.channel.send(embedRoll);
                
                let silverCount = 0;
                let amuletsObtained = 0;
                let newUnits = 0;

                let obtainedImages = [];
                let isDupe = [];

                for (let i = 0; i < 10; i++) {
                    const rarityRolled = Math.floor(Math.random() * (oneStarRate + twoStarRate + threeStarRate));

                    if (rarityRolled < threeStarRate) {
                        rollString += threeStarEmoji;
                        let rollImgData = await getRolledCharData(id, 3);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }

                        amuletsObtained += rollImgData[2];
                    } else if (rarityRolled < (threeStarRate + twoStarRate) || silverCount == 9) {
                        rollString += twoStarEmoji;
                        let rollImgData = await getRolledCharData(id, 2);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }
                        
                        amuletsObtained += rollImgData[2];
                    } else {
                        silverCount++;

                        rollString += oneStarEmoji;
                        let rollImgData = await getRolledCharData(id, 1);

                        obtainedImages.push(rollImgData[0]);
                        isDupe[i] = rollImgData[1];

                        if (!rollImgData[1]) {
                            newUnits++;
                        }
                        
                        amuletsObtained += rollImgData[2];
                    }
                    embedRoll.setDescription(`${rollString}`);
                    rollResults.edit(embedRoll);
                    
                }

                userData[id].amulets += amuletsObtained;

                createImage(message, obtainedImages, amuletsObtained, newUnits, isDupe, rollResults);
            } else {
                let reminder;
                if (userData[id].inroll) {
                    reminder = await message.channel.send(new MessageEmbed()
                        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                        .setAuthor(client.user.username, client.user.avatarURL())
                        .setTitle(`You are currently doing an x10 roll!`)
                        .setDescription(`Please wait until the roll is finished before trying again`)
                        .setFooter(footerText, client.user.avatarURL())
                        .setTimestamp());
                } else {
                    reminder = await message.channel.send(new MessageEmbed()
                        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                        .setAuthor(client.user.username, client.user.avatarURL())
                        .setTitle(`You need at least ${jewelCost} ${jewelEmoji} to roll!`)
                        .setDescription(`You are missing ${jewelCost-userData[id].jewels} ${jewelEmoji}`)
                        .setFooter(footerText, client.user.avatarURL())
                        .setTimestamp());
                }
                setTimeout(() => { reminder.delete();}, 5000);
            }
        }
    },
};