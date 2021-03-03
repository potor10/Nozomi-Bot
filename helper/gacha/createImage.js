module.exports = async (client, message, obtainedImages, isDupe) => {
    const { Canvas, Image } = require('canvas');
    const fs = require('fs');
    
    var canvas = new Canvas(client.gachaBG.width, client.gachaBG.height);
    var ctx = canvas.getContext('2d');
    
    const x_start = 196;
    const y_start = 82;
    const x_padding = 19;
    const y_padding = 17;

    ctx.drawImage(client.gachaBG, 0, 0, client.gachaBG.width, client.gachaBG.height);

    let x = x_start;
    let y = y_start + y_padding;
    
    for (let i = 0; i < obtainedImages.length; i++) {
        x += x_padding;
        ctx.drawImage(obtainedImages[i], x, y, client.gacha.sizThumb, client.gacha.sizThumb);

        x+= client.gacha.sizThumb;
        if (i == 4) {
            x = x_start;
            y += client.gacha.sizThumb + y_padding;
        }
    }

    x = x_start + client.gacha.sizThumb - client.gacha.sizOverlay;
    y = y_start + y_padding + client.gacha.sizThumb - client.gacha.sizOverlay;
    ctx.globalAlpha = 0.8;

    for (let i = 0; i < isDupe.length; i++) {
        x += x_padding;
        if (isDupe[i]) {
            ctx.drawImage(client.amuletSRC, x, y, client.gacha.sizOverlay, client.gacha.sizOverlay);
        }

        x+= client.gacha.sizThumb;
        if (i == 4) {
            x = x_start + client.gacha.sizThumb - client.gacha.sizOverlay;
            y += client.gacha.sizThumb + y_padding;
        }
    }

    const out = fs.createWriteStream(`./gacharoll${message.author.id}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    return new Promise((resolve, reject) => {
        out.on('finish', () =>  {
            console.log('LOG: The PNG agregate file was created.');
            resolve('Image Created');
        });
    });
}