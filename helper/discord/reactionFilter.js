module.exports = (client, author, reaction, user) => {
    return [client.emotes.jewelEmojiId].includes(reaction.emoji.id) && user.id === author.id;
}