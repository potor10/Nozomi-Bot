module.exports = async (message, obtainedImages, amuletsObtained, newUnits, isDupe, rollResults) => {
    const { Canvas, Image } = require('canvas');
    const { MessageEmbed } = require("discord.js");
    const fs = require('fs');
    
    let sizThumb = 121;
    let sizOverlay = 40;

    let amuletSRC = await loadImage(
        `https://media.discordapp.net/emojis/811495998450565140.png?width=${sizOverlay}&height=${sizOverlay}`);
    
    var canvas = new Canvas(sizThumb * 5, sizThumb * 2);
    var ctx = canvas.getContext('2d');
    
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < obtainedImages.length; i++) {
        ctx.drawImage(obtainedImages[i], x, y, sizThumb, sizThumb);

        x+= sizThumb;
        if (i == 4) {
            x = 0;
            y += sizThumb;
        }
    }

    x = sizThumb - sizOverlay;
    y = sizThumb - sizOverlay;
    ctx.globalAlpha = 0.8;

    for (let i = 0; i < isDupe.length; i++) {
        if (isDupe[i]) {
            ctx.drawImage(amuletSRC, x, y, sizOverlay, sizOverlay);
        }

        x+= sizThumb;
        if (i == 4) {
            x = sizThumb - sizOverlay;
            y += sizThumb;
        }
    }

    const out = fs.createWriteStream('./test.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  {
            console.log('LOG: The PNG agregate file was created.');

            let amuletStr = `You have earned ${amuletsObtained} ${amuletEmoji}`;

            if (newUnits > 0) {
                amuletStr += ` and have obtained ${newUnits} new characters!`
            }

            let combinedRoll = new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                .setDescription(amuletStr)
                .attachFiles(['./test.png'])
                .setImage('attachment://test.png')
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp();
            
            setTimeout(() => { 
                rollResults.delete();
                message.channel.send(combinedRoll);
                userData[message.author.id].inroll = false
            }, 3000);
    });
}