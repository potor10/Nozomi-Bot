module.exports = async (client, message, messageRows, messageDisplay) => {
    const { Canvas, Image } = require('canvas');
    const { MessageEmbed } = require("discord.js");
    const fs = require('fs');
    
    let width = 400;
    let textHeight = 50;
    
    var canvas = new Canvas(width, width * 3);
    var ctx = canvas.getContext('2d');
    
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < messageRows.length; i++) {
        ctx.fillText(messageRows[i], x, y);

        y += textHeight;
    }

    const out = fs.createWriteStream('./charlist.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  {
        console.log('LOG: The PNG agregate list was created.');

        messageDisplay.attachFiles(['./charlist.png']).setImage('attachment://charlist.png');

        message.channel.send(messageDisplay);
    });
}