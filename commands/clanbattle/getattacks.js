module.exports = {
    name: 'getattacks',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}getattacks [month] [date] [year] <@user>',
    description: 'Obtain attack information on a specific date.',
    ownerOnly: false,

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
    
        if (args.length < 3) return;

        let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
        let inputDate = new Date(Date.parse(parseDate));
        
        const pad = (num) => { 
            return ('00'+num).slice(-2) 
        };

        let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');
        let attackClanBattleId = getClanBattleId(inputDate);

        if (attackClanBattleId == -1) {
            let reminder = await message.reply(`${inputDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` is out of range of the Clan Battle period`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        }

        if (isNaN(inputDate.getTime())) {  
            let reminder = await message.reply(`Error: Invalid Date!`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        } 

        inputDate = inputDate.getUTCFullYear() + '-' + pad(inputDate.getUTCMonth() + 1)  + '-' + pad(inputDate.getUTCDate());

        let parseUser = message.author;
        let avatarUser = message.author.avatarURL();

        if (message.mentions.members.first()) {
            parseUser = message.mentions.members.first();
            avatarUser = message.mentions.members.first().user.avatarURL();
        }
    
        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, parseUser.id);

        console.log(`LOG: Retrieving attack on ${parseDate} from ${parseUser.id}`);

        let retrieveAttack = require('../../database/retrieveDatabase/retrieveAttack');
        let obtainedAttacks = await retrieveAttack(parseUser.id, inputDate);

        let damageMessage = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${parseUser.displayName||parseUser.username}'s attacks`)
            .setDescription(`On ${new Date(parseDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` : Clan Battle #${attackClanBattleId}`)
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();
        
        let totalDamage = obtainedAttacks.attempt1damage + obtainedAttacks.attempt2damage + obtainedAttacks.attempt3damage + obtainedAttacks.attempt4damage;
        damageMessage.addField(`Total Damage Dealt ${client.emotes.swordBigAttackEmoji}`, totalDamage);
        damageMessage.addField(`Attempt 1 Dealt ${client.emotes.swordSmallAttackEmoji}`, obtainedAttacks.attempt1damage, true);
        damageMessage.addField(`Attempt 2 Dealt ${client.emotes.swordSmallAttackEmoji}`, obtainedAttacks.attempt2damage, true);

        if (obtainedAttacks.attempt4damage != 0) {
            damageMessage.addField('\u200b','\u200b', true);
        }
        
        damageMessage.addField(`Attempt 3 Dealt ${client.emotes.swordSmallAttackEmoji}`, obtainedAttacks.attempt3damage, true);

        if (obtainedAttacks.attempt4damage != 0) {
            damageMessage.addField(`Attempt 4 Dealt ${client.emotes.swordSmallAttackEmoji}`, obtainedAttacks.attempt4damage, true);
            damageMessage.addField('\u200b','\u200b', true);
        }

        await message.channel.send(damageMessage);
        
    },
};