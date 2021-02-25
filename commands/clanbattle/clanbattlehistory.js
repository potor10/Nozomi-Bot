module.exports = {
    name: 'clanbattlehistory',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}clanbattlehistory',

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        let cbData = require('../../config/clanbattle.json');

        let cbKeys = Object.keys(cbData);

        let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');
        let currentClanBattleId = getClanBattleId(new Date());
    
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
        
        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let startPage = await parseFirstArgAsInt(args, 1);
        let displayPerPage = 10;

        let totalPages = Math.ceil(cbKeys.length / displayPerPage);
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
            i < cbKeys.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
            let clanBattleId = cbData[cbKeys[i]].id;
            let startDate = new Date(cbData[cbKeys[i]].start);
            let endDate = new Date(cbData[cbKeys[i]].end);

            let clanBattleStr = `Clan Battle #${clanBattleId}`;
            if (clanBattleId == currentClanBattleId) { 
                clanBattleStr += ` (Current)`
            }
            messageDisplay.addField(clanBattleStr, 
                `From ${startDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` to ${endDate.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}`);
        }

        await message.channel.send(messageDisplay);
    },
};