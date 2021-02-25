module.exports = async (client, message, text, emoji, option, cancelText) => {
    console.log(message);
    let emojiText = await message.channel.send(text);
    emojiText.react(emoji);
    let reactionFilter = require('./reactionFilter');
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(client, message.author, reaction, user), option)
             .catch(() => { message.channel.send(cancelText); });
};