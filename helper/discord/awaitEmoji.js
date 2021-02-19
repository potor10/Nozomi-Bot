module.exports = async (client, message, text, emoji, option, cancelText) => {
    let emojiText = await message.channel.send(text);
    emojiText.react(emoji);
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(client, message.author, reaction, user), option)
             .catch(() => { message.channel.send(cancelText); });
};