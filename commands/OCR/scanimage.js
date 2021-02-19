module.exports = {
    name: 'scanimage',
    aliases: [],
    category: 'OCR',
    utilisation: '{prefix}scanimage',

    async execute(client, message, args) {
        const maxAttempts = 3;

        let attempts = parseFirstArgAsInt(args, maxAttempts);
        if (attempts > maxAttempts || attempts < 1) {
            attempts = maxAttempts;
        }
    
        if (message.attachments.size > 0) {
            if (message.attachments.every(getOcrImage)){
                await returnOCR(message, attempts, maxAttempts);
            }
        }
    },
};