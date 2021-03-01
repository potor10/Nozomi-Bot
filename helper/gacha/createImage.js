module.exports = async (client, message, obtainedImages, amuletsObtained, newUnits, isDupe, rollResults) => {
    const { Canvas, Image } = require('canvas');
    const { MessageEmbed } = require("discord.js");
    const fs = require('fs');
    
    var canvas = new Canvas(client.gacha.sizThumb * 5, client.gacha.sizThumb * 2);
    var ctx = canvas.getContext('2d');
    
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < obtainedImages.length; i++) {
        ctx.drawImage(obtainedImages[i], x, y, client.gacha.sizThumb, client.gacha.sizThumb);

        x+= client.gacha.sizThumb;
        if (i == 4) {
            x = 0;
            y += client.gacha.sizThumb;
        }
    }

    x = client.gacha.sizThumb - client.gacha.sizOverlay;
    y = client.gacha.sizThumb - client.gacha.sizOverlay;
    ctx.globalAlpha = 0.8;

    for (let i = 0; i < isDupe.length; i++) {
        if (isDupe[i]) {
            ctx.drawImage(client.amuletSRC, x, y, client.gacha.sizOverlay, client.gacha.sizOverlay);
        }

        x+= client.gacha.sizThumb;
        if (i == 4) {
            x = client.gacha.sizThumb - client.gacha.sizOverlay;
            y += client.gacha.sizThumb;
        }
    }

    const out = fs.createWriteStream('./gacharoll.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  {
            console.log('LOG: The PNG agregate file was created.');

            let amuletStr = `You have earned ${amuletsObtained} ${client.emotes.amuletEmoji}`;

            if (newUnits > 0) {
                amuletStr += ` and have obtained ${newUnits} new characters!`
            }

            let combinedRoll = new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                .setDescription(amuletStr)
                .attachFiles(['./gacharoll.png'])
                .setImage('attachment://gacharoll.png')
                .setFooter(client.config.discord.footerText, client.user.avatarURL())
                .setTimestamp();
            
            setTimeout(async () => { 
                await rollResults.delete();
                await message.channel.send(combinedRoll);
                client.userData[message.author.id].inroll = false
            }, 3000);
    });
}