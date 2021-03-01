module.exports = async (client, message, messageRows, messageDisplay) => {
    const { Canvas, Image } = require('canvas');
    const { MessageEmbed } = require("discord.js");
    const fs = require('fs');
    
    let width = 960;
    let height = 540;

    let textHeight = 88;
    
    var canvas = new Canvas(width, height);
    var ctx = canvas.getContext('2d');
    
    let x = 600;
    let y = 100;

    let loadImage = require('../../helper/gacha/loadImage');
    let backgroundImg = await loadImage(`../../img/hatsune_shiori.jpeg`);
    ctx.drawImage(backgroundImg, 0 , 0, 960, 540);
    
    ctx.font = '80px serif';

    for (let i = 0; i < messageRows.length; i++) {
        ctx.fillText(messageRows[i], x, y, 300);
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