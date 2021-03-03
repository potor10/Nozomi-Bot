module.exports = {
    name: 'givegems',
    aliases: [],
    category: 'Admin',
    utilisation: '{prefix}givegems amount <@user>',
    description: 'Gives gems',
    adminonly: true,

    async execute(client, message, args) {
        if (!Array.isArray(args)) {
            console.log("LOG: Error parsing arguments in givegems");
            return;
        }
    
        if (args.length != 2) return;

        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let gemsGiven = parseFirstArgAsInt(args, 0);

        if (message.mentions.members.first()) {
            let gemTarget =  message.mentions.members.first();

            let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
            createUserIfNotExist(client, gemTarget.id);
            let id = gemTarget.id;

            client.userData[id].jewels = client.userData[id].jewels + gemsGiven;
            let reminder = await message.reply(`${gemsGiven} ${client.emotes.jewelEmoji} was given to ` +
                `${gemTarget.displayName||gemTarget.username}`);
            
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        } else {
            let reminder = await message.reply(`You did not include a valid target`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        }
        
    },
};