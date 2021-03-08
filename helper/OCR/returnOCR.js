module.exports = async (client, message, attempts, maxAttempts) => {
    const { createWorker } = require('tesseract.js');
    
    message.attachments.forEach(async attachment => {
        const worker = createWorker({
            //logger: m => console.log(m), // Add logger here
          });

        let height = attachment.height;
        let width = attachment.width;
        if (height > 500 || width > 800) {
            const maxWidth = 800;
            const maxHeight = 500;

            const ratio = Math.min(maxWidth / width, maxHeight / height);
            
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        let newURL = `${attachment.url}?width=${width}&height=${height}`;
        newURL = newURL.replace(`cdn`, `media`);
        newURL = newURL.replace(`com`, `net`);

        console.log(`LOG: Found image with URL ${newURL}`);

        let aspectx = width / 2208;
        let aspecty = height / 1242;

        let paddingx = 0;
        let paddingy = 0;

        if (aspecty * 2208 < width) {
            paddingx = Math.floor((width - (aspecty * 2208)) / 2);
            width = width - (paddingx * 2);
        }
        
        if (aspectx * 1242 < height) {
            paddingy = Math.floor((height - (aspectx * 1242)) / 2);
            height = height - (paddingy * 2);
        }

        const rectangles = [
        {
            left: Math.floor(1647/2208 * width) + paddingx,
            top: Math.floor(70/1242 * height) + paddingy,
            width: Math.floor(187/2208 * width),
            height: Math.floor(50/1242 * height),
        },
        {
            left: Math.floor(220/500 * width) + paddingx,
            top: Math.floor(50/280 * height) + paddingy,
            width: Math.floor(170/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width) + paddingx,
            top: Math.floor(75/280 * height) + paddingy,
            width: Math.floor(45/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width) + paddingx,
            top: Math.floor(130/280 * height) + paddingy,
            width: Math.floor(45/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width) + paddingx,
            top: Math.floor(190/280 * height) + paddingy,
            width: Math.floor(45/500 * width),
            height: Math.floor(25/280 * height),
        },
        ];

        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const values = [];
        isClan = true;

        for (let i = 0; i < rectangles.length + attempts - maxAttempts; i++) {
            const { data: { text } } = await worker.recognize(newURL, {rectangle: rectangles[i]} );
            console.log(`LOG: Scanning, dimension: (${rectangles[i].left}, ${rectangles[i].top}, ${rectangles[i].width}, ${rectangles[i].height})`);

            if (i==0 && text.indexOf("Trial Run") == -1) {
                isClan = false;
                console.log(`LOG: Image was not detected as clan war image`);
                break;
            } else if (i==0) {
                message.react(client.emojis.cache.get(client.emotes.nozomiBlushEmojiId));
            }
            values.push(text);
        }

        if (isClan) {
            let updateOCRValues = require('./updateOCRValues');
            await updateOCRValues(client, message, values, rectangles);
        }
        await worker.terminate();
    });
}