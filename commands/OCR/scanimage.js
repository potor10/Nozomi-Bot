module.exports = {
    name: 'scanimage',
    aliases: [],
    category: 'OCR',
    utilisation: '{prefix}scanimage',

    async execute(client, message, args) {
        const maxAttempts = 3;

        let parseFirstArgAsInt = require('../../helper/discord/parseFirstArgAsInt');
        let attempts = parseFirstArgAsInt(args, maxAttempts);
        if (attempts > maxAttempts || attempts < 1) {
            attempts = maxAttempts;
        }
    
        if (message.attachments.size > 0) {
            let isImage = require('../../helper/OCR/isImage');
            if (message.attachments.every(isImage)){
                let returnOCR = require('../../helper/OCR/returnOCR');
                await returnOCR(client, message, attempts, maxAttempts);
            }
        }
    },
};