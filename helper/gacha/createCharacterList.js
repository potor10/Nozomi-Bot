module.exports = async (client, message, messageRows, messageDisplay) => {
    const { Canvas, Image } = require('canvas');
    const { MessageEmbed } = require("discord.js");
    const fs = require('fs');
    
    let width = 1920;
    let height = 1080;

    let textHeight = 44;
    
    var canvas = new Canvas(width, height);
    var ctx = canvas.getContext('2d');
    
    let x = 1200;
    let y = 100;

    let loadImage = require('../../helper/gacha/loadImage');
    let backgroundImg = await loadImage(`./img/hatsune_shiori.jpeg`);
    ctx.drawImage(backgroundImg, 0 , 0, 1920, 1080);
    
    ctx.font = 'bold 40px PT Sans';
    ctx.fillStyle = `rgb(
        ${Math.floor(Math.random() * 170) + 39},
        ${Math.floor(Math.random() * 170) + 39},
        ${Math.floor(Math.random() * 170) + 39})`;

    for (let i = 0; i < messageRows.length; i++) {
        ctx.fillText(messageRows[i], x, y, 600);
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