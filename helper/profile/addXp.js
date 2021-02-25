module.exports = async message => {
    let currentTime = Date.now();
    let id = message.author.id;

    let createUserIfNotExist = require('./createUserIfNotExist');
    createUserIfNotExist(id);

    if (currentTime - userData[id].lastmessage > 30000) {
        let newXP = Math.floor(Math.random() * 5) + 1;
        userData[id].exp += newXP;

        //console.log(`LOG: ${newXP} XP has been granted to ${message.author.username} (${id}) they have ${userData[id].exp} XP now`);

        userData[id].lastmessage = currentTime;

        let curLevel = 1 + Math.floor(Math.pow(userData[id].exp, 0.8) / 10);

        if (curLevel > userData[id].level) {
            // Level up!
            userData[id].level = curLevel;

            let earnedJewels = curLevel * 10 * (Math.floor(Math.random() * 50) + 1);
            userData[id].jewels += earnedJewels;

            let randomNozomi = [
                'https://static.wikia.nocookie.net/princess-connect/images/4/45/Cute-human-longsword-sakurai_nozomi_rare_gacha001-0-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/1/1c/Nozomi-idolastrum-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/6/63/Nozomi-christmas-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/89/Cute-human-longsword-sakurai_nozomi_rare_gacha001-1-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/83/Cute-human-longsword-sakurai_nozomi_normal_start-1-normal.png'
            ]

            let nozomiIdx = Math.floor(Math.random() * 5);

            let levelUpMessage = new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setThumbnail(randomNozomi[nozomiIdx])
                .setTitle(`${message.author.displayName||message.author.username}'s Level Up!`)
                .setDescription(`You've leveled up to level **${curLevel}**! \n\n` +
                    `Congrats, you've earned ${earnedJewels} ${jewelEmoji}`)
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp();

            if (message.guild.channels.cache.find(channel => channel.name === defaultResponseChannelName)) { 
                await message.guild.channels.cache.find(channel => channel.name === defaultResponseChannelName).send(levelUpMessage);
            } else {
                await message.channel.send(levelUpMessage);
            }

            console.log(`LOG: ${message.author.username} (${id}) has leveled up to ${curLevel}`);
        }
    }
};