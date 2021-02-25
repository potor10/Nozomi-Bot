module.exports = {
    name: 'getclanbattle',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}getclanbattle',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        let initCbidObj = require('../../database/updateObject/initCbidObj');
        client.currentClanBattleId = await initCbidObj(client);

        let searchCBid = client.currentClanBattleId;
        
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }

        let cbDate = new Date(client.config.clanbattle.cbStart);
        
        if (args.length < 3) {
            let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
            searchCBid = parseFirstArgAsInt(args, client.currentClanBattleId);

            if (searchCBid > client.currentClanBattleId) {
                searchCBid = client.currentClanBattleId;
            }

            let startDate = new Date(cbStart);
            startDate.setUTCMonth(searchCBid + startDate.getUTCMonth());
            cbDate = new Date(startDate);
        } else if (args.length >= 3) {
            let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
            date = Date.parse(parseDate);
            
            cbDate = new Date(date);

            if (isNaN(cbDate.getTime())) {  
                let reminder = await message.reply(`Error: Invalid Date!`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            } 
            
            if (cbDate < cbStart) {
                cbDate = new Date(client.config.clanbattle.cbStart);
            } else if (cbDate > new Date()) {
                cbDate = new Date();
            }
            searchCBid = (cbDate.getUTCMonth() - cbStart.getUTCMonth()) + ((cbDate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
        }

        console.log(`LOG: Searching Clan Battle ${searchCBid}`);

        let parseUser = message.author;
        let avatarUser = message.author.avatarURL();

        if (message.mentions.members.first()) {
            parseUser = message.mentions.members.first();
            avatarUser = message.mentions.members.first().user.avatarURL();
        }

        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, parseUser.id);

        console.log(`LOG: Retrieving Clan Battle #${searchCBid} from ${parseUser.id}`);

        let retrieveDamageFromClanId = require('../../database/retrieveDatabase/retrieveDamageFromClanId');
        let damageValues = await retrieveDamageFromClanId(parseUser.id, searchCBid);

        let damageMessage = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${parseUser.displayName||parseUser.username}'s damage on Clan Battle #${searchCBid}`)
            .setDescription(`Battle occured on the month of ${cbDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC'})}`)
            .addField(`Total Damage Dealt ${client.emotes.swordBigAttackEmoji}`, damageValues[0])
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();

        let obtainedAttempts = damageValues[1];
        obtainedAttempts.sort(function(x, y) {
            if (x.attackdate < y.attackdate) {
                return -1;
            }
            if (x.attackdate < y.attackdate) {
                return 1;
            }
            return 0;
        });

        for (let i in obtainedAttempts) {
            let parseDate = obtainedAttempts[i].attackdate;
            date = Date.parse(parseDate);

            damageMessage.addField(`Attack On ${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}`, 
                `From Clan Battle #${searchCBid}`);
            damageMessage.addField(`Attempt 1 ${client.emotes.swordSmallAttackEmoji}`, `${obtainedAttempts[i].attempt1damage}`, true);
            damageMessage.addField(`Attempt 2 ${client.emotes.swordSmallAttackEmoji}`, `${obtainedAttempts[i].attempt2damage}`, true);
            damageMessage.addField(`Attempt 3 ${client.emotes.swordSmallAttackEmoji}`, `${obtainedAttempts[i].attempt3damage}`, true);
        }
        

        await message.channel.send(damageMessage);
    },
};