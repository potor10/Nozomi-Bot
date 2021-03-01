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
                for (let j = 0; j < characterKeys.length; j++) {
                    if (characterKeys[j].split(/,\s?/)[0].toLowerCase() == character.toLowerCase() || 
                        characterKeys[j].split(/,\s?/)[1] == character) {
                        charname = characterKeys[j];
                        starlevel = i + 1;
                        break;
                    }
                }

                if(starlevel != -1) {
                    break;
                }
            }

            if (starlevel != -1) {
                let charFullImg = client.gachaData[starlevel][charname].fullimageurl;
                let charSubImg = client.gachaData[starlevel][charname].subimageurl;

                let height = client.gachaData[starlevel][charname].height;
                let birthday = client.gachaData[starlevel][charname].birthday;
                let age = client.gachaData[starlevel][charname].age;
                let species = client.gachaData[starlevel][charname].species;
                let guild = client.gachaData[starlevel][charname].guild;
                let likes = client.gachaData[starlevel][charname].likes;
                let cv = client.gachaData[starlevel][charname].cv;
                let realname = client.gachaData[starlevel][charname].realname;
                let weight = client.gachaData[starlevel][charname].weight;
                let bloodtype = client.gachaData[starlevel][charname].bloodtype;

                let ubskillname = client.gachaData[starlevel][charname].ubskillname;
                let ubskill = client.gachaData[starlevel][charname].ubskill;
                let skill1name = client.gachaData[starlevel][charname].skill1name;
                let skill1 = client.gachaData[starlevel][charname].skill1;
                let skill2name = client.gachaData[starlevel][charname].skill2name;
                let skill2 = client.gachaData[starlevel][charname].skill1;
                let exskillname = client.gachaData[starlevel][charname].exskillname;
                let exskill = client.gachaData[starlevel][charname].exskill;

                let starstr = '★'.repeat(starlevel);
    
                let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`${starstr} ${charname.split(/,\s?/)[0]}`)
                    .setDescription(`${charname.split(/,\s?/)[1]}`)
                    .setThumbnail(charSubImg)
                    .setImage(`${charFullImg}`)
                    .addFields(
                        { name: `Height`, value: height, inline: true },
                        { name: `Weight`, value: weight, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true },

                        { name: `Species`, value: species, inline: true },
                        { name: `Birthday`, value: birthday, inline: true },
                        { name: `Age`, value: age, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true },
                        { name: `Blood Type`, value: bloodtype, inline: true },

                        { name: `Likes`, value: likes, inline: false },
                        { name: `Guild`, value: guild, inline: false },
                        { name: `Real Name`, value: realname, inline: false },
                        { name: `CV`, value: cv, inline: false },

                        { name: '\u200b', value: '\u200b', inline: false },
                        
                        { name: `Union Burst: ${ubskillname}`, value: ubskill, inline: false },
                        { name: `Skill 1: ${skill1name} `, value: skill1, inline: false },
                        { name: `Skill 2: ${skill2name} `, value: skill2, inline: false },
                        { name: `EX Skill: ${exskillname}`, value: exskill, inline: false }
                    )
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