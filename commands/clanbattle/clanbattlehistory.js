module.exports = {
    name: 'clanbattlehistory',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}clanbattlehistory',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        let initCbidObj = require('../../database/updateObject/initCbidObj');
        currentClanBattleId = await initCbidObj(client);
    
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }

        let cbArray = [];
        for (let i = 0; i <= currentClanBattleId; i++) {
            let curDate = new Date(client.config.clanbattle.cbStart);
            curDate.setUTCMonth(i + curDate.getUTCMonth());
            let cbDate = curDate;
            cbArray.push(cbDate);
        }
        
        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let startPage = await parseFirstArgAsInt(args, 1);
        let displayPerPage = 10;

        let totalPages = Math.ceil(cbArray.length / displayPerPage);
        if (totalPages <= 0) { totalPages = 1; }
        if (startPage < 1 || startPage > totalPages ) {
            startPage = 1;
        }

        console.log(`LOG: Retrieving Clan Battle information from page ${startPage}`);

        let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail("https://static.wikia.nocookie.net/princess-connect/images/5/5b/11-25-20CB.jpg")
            .setTitle(`Clan Battle History`)
            .setDescription(`page ${startPage} / ${totalPages}`)
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();

        for (let i = (startPage - 1) * displayPerPage; 
            i < cbArray.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
            let clanBattleStr = `Clan Battle #${i}`;
            if (i == currentClanBattleId) { 
                clanBattleStr += ` (Current)`
            }
            messageDisplay.addField(clanBattleStr, 
                `Occured on the month of ${cbArray[i].toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC'})}`);
        }

        await message.channel.send(messageDisplay);
    },
};