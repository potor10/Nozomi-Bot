module.exports = async (client, message, emojiText, emoji, option, cancelText) => {
    emojiText.react(emoji);
    let reactionFilter = require('./reactionFilter');
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(client, message.author, reaction, user), option)
             .catch(() => { emojiText.edit(cancelText); 
                emojiText.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)); });
};