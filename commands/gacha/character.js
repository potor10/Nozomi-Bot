module.exports = {
    name: 'character',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}character',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        if (!(message.author.id in collectionData)) {
            client.collectionData[message.author.id] = {};
        }
    
        if (!Array.isArray(args)) {
            await message.channel.send(`Error in parsing arguments`);
        } 
        if (args.length) {
            let character = args.shift().trim();
            
            if (character in client.collectionData[message.author.id]) {
                let starlevel = client.collectionData[message.author.id][character];
                let charFullImg = client.gachaData[starlevel][character].fullimageurl;
    
                let starstr = '★'.repeat(starlevel);
    
                let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${starstr} ${character}`)
                    .setDescription(`Owned By ${message.author.displayName||message.author.username}`)
                    .setImage(`${charFullImg}`)
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();
                
                await message.channel.send(messageDisplay);
            } else {
                let reminder = await message.reply(`You don't own ${character}`);
                setTimeout(() => { reminder.delete();}, 5000);
            }
        } else {
            let reminder = await message.reply(`Please add a character name after the command`);
            setTimeout(() => { reminder.delete();}, 5000);
        }
    },
};