module.exports = {
    name: 'characters',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}characters <page number>',
    description: 'View the characters you have obtained from gacha.',
    adminonly: false,

    async execute(client, message, args) {       
        const { MessageEmbed } = require("discord.js");
        
        if (!(message.author.id in client.collectionData)) {
            client.collectionData[message.author.id] = {};
        }
    
        let displayPerPage = 20;

        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let startPage = await parseFirstArgAsInt(args, 1);
        let characters = Object.keys(client.collectionData[message.author.id]);
    
        characters.sort(function(x, y) {
            if (client.collectionData[message.author.id][x] < client.collectionData[message.author.id][y]) {
              return 1;
            } else if (client.collectionData[message.author.id][x] > client.collectionData[message.author.id][y]) {
              return -1;
            } else if (x > y)  {
              return 1;
            } else if (x < y) {
              return -1;
            }
            return 0;
          });
    
        let totalPages = Math.ceil(characters.length / displayPerPage);
        if (totalPages <= 0) { totalPages = 1; }
        if (startPage < 1 || startPage > totalPages ) {
            startPage = 1;
        }

        let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(message.author.avatarURL())
            .setTitle(`${message.author.displayName||message.author.username}'s character list`)
            .setDescription(`page ${startPage} / ${totalPages}`)
            .setFooter(client.config.discord.footerText, client.user.avatarURL())
            .setTimestamp();
            
        let messageRows = [];
        
        for (let i = (startPage - 1) * displayPerPage; 
            i < characters.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
            let starlevel = '☆'.repeat(client.collectionData[message.author.id][characters[i]]);
            let charstr = `${starlevel} ${characters[i].split(/,\s?/)[0]}`;
    
            messageRows.push(charstr);
        }

        let createCharacterList = require('../../helper/gacha/createCharacterList');
        await createCharacterList(client, message, messageRows, messageDisplay);
    },
};