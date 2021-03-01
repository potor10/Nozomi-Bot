module.exports = {
    name: 'character',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}character [character name]',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        if (!(message.author.id in client.collectionData)) {
            client.collectionData[message.author.id] = {};
        }
    
        if (!Array.isArray(args)) {
            await message.channel.send(`Error in parsing arguments`);
        } 
        if (args.length) {
            let character = args.join(" ").trim();
            
            let starlevel = -1;
            let charname;

            for (let i = 0; i < 3; i++) {
                let characterKeys = Object.keys(client.gachaData[i + 1]);
                const matchingKeys = characterKeys.filter(key => key.split(/,\s?/)[0].toLowerCase() == character.toLowerCase() || 
                    key.split(/,\s?/)[1] == character);

                if(matchingKeys.length != 0) {
                    charname = matchingKeys[0];
                    starlevel = i + 1;
                    break;
                }
            }

            if (starlevel != -1) {
                let charFullImg = client.gachaData[starlevel][charname].fullimageurl;
    
                let starstr = '★'.repeat(starlevel);
    
                let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${starstr} ${character}`)
                    .setDescription(`Owned By ${message.author.displayName||message.author.username}`)
                    .setImage(`${charFullImg}`)
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();
                
                await message.channel.send(messageDisplay);
            } else {
                let reminder = await message.reply(`${character} is not a character`);
                setTimeout(() => { reminder.delete();}, 5000);
            }
        } else {
            let reminder = await message.reply(`Please add a character name after the command`);
            setTimeout(() => { reminder.delete();}, 5000);
        }
    },
};