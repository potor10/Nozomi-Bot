const { start } = require("repl");

module.exports = {
    name: 'getclanbattle',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}getclanbattle',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");

        let cbData = require('../../config/clanbattle.json');

        let cbKeys = Object.keys(cbData);
        let minCbid = cbData[cbKeys[0]].id;
        let maxCbid = cbData[cbKeys[cbKeys.length - 1]].id;

        let startDate;
        let endDate;

        let searchCBid;
        
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
        
        if (args.length < 3) {
            let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
            searchCBid = parseFirstArgAsInt(args, client.currentClanBattleId);

            if (searchCBid > maxCbid || searchCBid < minCbid) {
                let reminder = await message.reply(`CB #${searchCBid} is not a valid Clan Battle`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            }

            print(cbData);

            startDate = new Date(cbData[searchCBid].start);
            endDate = new Date(cbData[searchCBid].end);
            
        } else if (args.length >= 3) {
            let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
            date = Date.parse(parseDate);
            
            let cbDate = new Date(date);

            if (isNaN(cbDate.getTime())) {  
                let reminder = await message.reply(`Error: Invalid Date!`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            } 

            let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');
            searchCBid = getClanBattleId(cbDate);
            
            if (searchCBid == -1) {
                let reminder = await message.reply(`${cbDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` is out of range of the Clan Battle period`);
                setTimeout(() => { reminder.delete();}, 5000);
                return;
            }
            
            startDate = new Date(cbData[searchCBid].start);
            endDate = new Date(cbData[searchCBid].end);
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
            .setDescription(`Clan Battle occured from ${startDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` to ${endDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}`)
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