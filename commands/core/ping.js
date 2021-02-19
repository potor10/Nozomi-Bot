module.exports = {
    name: 'ping',
    aliases: [],
    category: 'Core',
    utilisation: '{prefix}ping',

    execute(client, message) {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server 
        // (one-way, not round-trip)
        let m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}` + 
                `ms. API Latency is ${Math.round(client.ping)}ms`);
    },
};