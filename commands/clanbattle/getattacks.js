module.exports = {
    name: 'getattacks',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}getattacks',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
    
        if (args.length < 3) return;

        let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
        date = Date.parse(parseDate);
        
        const pad = (num) => { 
            return ('00'+num).slice(-2) 
        };

        let newdate = new Date(date);
        let attackClanBattleId = (newdate.getUTCMonth() - cbStart.getUTCMonth()) + ((newdate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
        currentClanBattleId = await initCbid();

        if ((attackClanBattleId > currentClanBattleId) || (attackClanBattleId < 0)) {
            let reminder = await message.reply(`${newdate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` is out of range of the Clan Battle period`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        }

        if (isNaN(newdate.getTime())) {  
            let reminder = await message.reply(`Error: Invalid Date!`);
            setTimeout(() => { reminder.delete();}, 5000);
            return;
        } 

        newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());

        console.log(`LOG: Date Parsed From Args, Found ${date}, Converted To ${newdate}`);

        let parseUser = message.author;
        let avatarUser = message.author.avatarURL();

        if (message.mentions.members.first()) {
            parseUser = message.mentions.members.first();
            avatarUser = message.mentions.members.first().user.avatarURL();
        }
    
        createUserIfNotExist(parseUser.id);

        console.log(`LOG: Retrieving attack on ${parseDate} from ${parseUser.id}`)
        let obtainedAttacks = await retrieveAttack(parseUser.id, newdate);

        let damageMessage = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${parseUser.displayName||parseUser.username}'s attacks`)
            .setDescription(`On ${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` : Clan Battle #${attackClanBattleId}`)
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp();
        
        let totalDamage = obtainedAttacks.attempt1damage + obtainedAttacks.attempt2damage + obtainedAttacks.attempt3damage;
        damageMessage.addField(`Total Damage Dealt ${swordBigAttackEmoji}`, totalDamage);
        damageMessage.addField(`Attempt 1 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt1damage, true);
        damageMessage.addField(`Attempt 2 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt2damage, true);
        damageMessage.addField(`Attempt 3 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt3damage, true);

        await message.channel.send(damageMessage);
        
    },
};