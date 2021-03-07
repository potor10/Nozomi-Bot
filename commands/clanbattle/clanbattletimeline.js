module.exports = {
    name: 'clanbattletimeline',
    aliases: [],
    category: 'Clan Battle',
    utilisation: '{prefix}clanbattletimeline <page number>',
    description: 'Obtain a directory of all available Clan Battles and when they occured.',
    adminonly: false,

    async execute(client, message, args) {
        const { MessageEmbed } = require("discord.js");
        
        let cbData = require('../../config/clanbattle.json');

        let cbKeys = Object.keys(cbData);

        let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');

        let date = new Date();
        date = new Date(date.toLocaleString('en-US', {timezone: 'PST'}));
        date.setHours(date.getHours() - 5);

        date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

        let currentClanBattleId = getClanBattleId(date);
    
        if (!Array.isArray(args)) {
            message.channel.send("Error parsing arguments");
            return;
        }
        
        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let startPage = await parseFirstArgAsInt(args, -1);
        let displayPerPage = 10;

        let totalPages = Math.ceil(cbKeys.length / displayPerPage);
        if (totalPages <= 0) { totalPages = 1; }
        if (startPage < 1 || startPage > totalPages ) {
            if (currentClanBattleId != -1) {
                startPage = Math.floor(currentClanBattleId / displayPerPage) + 1;
            } else {
                startPage = 1;
            }
        }

        console.log(`LOG: Retrieving Clan Battle information from page ${startPage}`);

        let cbthumb = 'https://scontent-lax3-1.cdninstagram.com/v/t51.2885-15/155987841_148239183832156_2839587873359787990_n.jpg?_nc_cat=105&ccb=3&_nc_sid=8ae9d6&_nc_ohc=xMWd-2ALLigAX-0qTlA&_nc_ht=scontent-lax3-1.cdninstagram.com&oh=6eaf97200b39c360ebe6e3ad51ce5280&oe=606393DA';

        let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(cbthumb)
            .setTitle(`Clan Battle Timeline`)
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