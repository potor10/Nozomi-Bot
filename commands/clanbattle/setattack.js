module.exports = {
    name: 'setattack',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}setattack [attempt number] [damage] [month] [date] [year]',
    description: 'Set the damage of an existing attack attempt. You can use .setattack 4 to add a 4th attack if you have done one',

    async execute(client, message, args) {        
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
    
        if (args.length < 5) return;

        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let attemptnumber = parseFirstArgAsInt(args, -1);

        if (attemptnumber == -1) {
            await message.reply(`Invalid attempt number!`);
            return;
        }

        let attemptdamage = parseFirstArgAsInt(args, 0);

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
    
        let createUserIfNotExist = require('../../helper/profile/createUserIfNotExist');
        createUserIfNotExist(client, message.author.id);

        console.log(`LOG: Updating attack on ${parseDate} from ${message.author.id}`);

        let updateAttackAttempt = require('../../database/updateDatabase/updateAttackAttempt');
        await updateAttackAttempt(message.author.id, inputDate, attemptnumber, attemptdamage);

        let updatedmessage = await message.channel.send(`Updated ${message.author.username}'s Attack on ` +
            `${new Date(parseDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}. ` +
            `Set Attempt ${attemptnumber} damage to ${attemptdamage}`); 
        setTimeout(() => { updatedmessage.delete();}, 5000);
    },
};