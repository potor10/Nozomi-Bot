module.exports = {
    name: 'give',
    aliases: [],
    category: 'Admin',
    utilisation: '{prefix}give character <@user>',
    description: 'Gives characters',
    adminonly: true,

    async execute(client, message, args) {
        if (!Array.isArray(args)) {
            console.log("LOG: Error parsing arguments in give");
            return;
        }
    
        if (args.length < 2) return;

        let character = args.join(" ").replace(/<@.*>/g, '').trim();
        
        let starlevel = -1;
        let charname;

        if (message.mentions.members.first()) {
            let charTarget =  message.mentions.members.first();

            let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
            createUserIfNotExist(client, charTarget.id);
            let id = charTarget.id;

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
                if (!(id in client.collectionData)) {
                    client.collectionData[id] = {};
                }

                client.collectionData[id][charname] = starlevel;
            
                let reminder = await message.reply(`${charname} was given to ${charTarget.displayName||charTarget.username}`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            } else {
                let reminder = await message.reply(`${character} is not a valid character`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            }
        } else {
            let reminder = await message.reply(`You did not include a valid target`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        }
        
    },
};