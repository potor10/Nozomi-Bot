module.exports = {
    name: 'characters',
    aliases: [],
    category: 'Gacha',
    utilisation: '{prefix}characters',

    async execute(client, message, args) {
        if (!(message.author.id in collectionData)) {
            collectionData[message.author.id] = {};
        }
    
        let displayPerPage = 5;
        let startPage = await parseFirstArgAsInt(args, 1);
        let characters = Object.keys(collectionData[message.author.id]);
    
        characters.sort(function(x, y) {
            if (collectionData[message.author.id][x] < collectionData[message.author.id][y]) {
              return 1;
            }
            if (collectionData[message.author.id][x] > collectionData[message.author.id][y]) {
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
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp();
    
        for (let i = (startPage - 1) * displayPerPage; 
            i < characters.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
            let starlevel = '★'.repeat(collectionData[message.author.id][characters[i]]);
            let charstr = `\`\`\`${starlevel} ${characters[i]}\`\`\``;
    
            messageDisplay.addField('\u200b', charstr);
        }
    
        await message.channel.send(messageDisplay);
    },
};