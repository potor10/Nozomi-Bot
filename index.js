/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, RichEmbed } = require("discord.js");

// Initialize Discord Client
const client = new Client();

const fs = require("fs");
/** @type {{clanDamage:Number,dailyDamage:Number,totalDamage:Number,level:Number,exp:Number,rank:Number}[]} */
let userdata = JSON.parse(fs.readFileSync("./userdata.json", "utf8"));

// Rad Dream Constants
const updateVal = 6000;
let marketCrash = false;
let marketUpdateSkew = 0;
let marketUpdateAmt = 0;
let timeUpdate = 0;

// Load Config Json with Prefix and Token 
let { token, prefix } = require("./config.json");
prefix = prefix || ".";

const saveBitconnect = () => fs.writeFileSync("./bitconnect.json", 
                                    JSON.stringify(bitconnectdata, null, 4));

const resetBitconnect = () => {
    bitconnectdata = [{
        time: Date.now(),
        price: 400,
        flucSkew: 0.5,
        flucAmt: 10
    }];
    saveBitconnect();
};

/** @param {import("discord.js").Message} message */
const checkCrash = async message => {
    if (!marketCrash) {
        await message.channel.send(`The Current Price For A Bitconnect Is:` + 
                            ` **\$${bitconnectdata.slice(-1)[0].price}**`);
    } else {
        marketCrash = false;
        for (let x in userdata) userdata[x].bitconnect = 0;
        resetBitconnect();
        saveBitconnect();
        saveUsers();
        await message.channel.send("Uh Oh! The Price Of Bitconnect Went Below 0, **IT'S A MARKET CRASH!**\n" +
                                    "Everyone Loses Their Bitconnect (Market Will Reset)");
        return true;
    }
};

const reactionFilter = (author, reaction, user) => 
        ["bitconnect"].includes(reaction.emoji.name) && user.id === author.id;

const saveUsers = () => fs.writeFileSync("./userdata.json", 
                                    JSON.stringify(userdata, null, 4));

const resetUsers = () => {
    userdata = [{
        
    }];
    saveUsers();
};

const getOrCreateUser = id => {
    if (!userdata[id]) userdata[id] = {
        clanDamage: 0,
        dailyDamage: 0,
        totalDamage: 0,
        level: 0,
        exp: 0,
        rank: 0
    };
    return userdata[id];
};

// Commands
const help = message => message.author.send(`HEY HEY HENLO 👀 \n\n` + 
                                            `I SEE YOU NEED HELP YOU DUMB LOSER \n` + 
                                            `TYPE **.ebola** TO BECOME DOWN SYNDROMED \n` + 
                                            `TYPE **.daily** TO OBTAIN YOUR DAILY REWARDS AND SETUP YOUR PROFILE \n` + 
                                            `TYPE **.spin** TO SPIN THE WHEEL OF BITCONNECT\n` + 
                                            `TYPE **.profile** [@user] TO LOOK AT PROFILES \n` + 
                                            `TYPE **.price <size>** TO LOOK AT BITCONNECT PRICES \n` + 
                                            `TYPE **.buy/.sell <amt> <size>** TO PURCHASE OR SELL BITCONNECT`);

const parseFirstArgAsInt = (args, defaultValue) => {
    if (!Array.isArray(args)) return defaultValue;
    if (args.length) {
        let parseAmt = parseInt(args.shift().toLowerCase(), 10);
        if (!isNaN(parseAmt) && parseAmt > 0) return parseAmt;
    } else return defaultValue;
};

/** @param {import("discord.js").Message} message */
const profile = async message => {
    
    let profileUser = message.mentions.members.first() || message.author;
    let profileData = getOrCreateUser(profileUser.id);

    await message.channel.send(new RichEmbed()
        .setURL("https://youtu.be/_zlGR5i9u_Q")
        .setColor(3447003)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setThumbnail(profileUser.avatarURL)
        .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
        .setDescription("Displaying Profile.")
        .addField("Level", profileData.level)
        .addField("Damage Dealt This Clan War", profileData.clanDamage)
        .addField("Damage Dealt Today", profileData.dailyDamage)
        .addField("Total Damage Dealt", profileData.totalDamage)
        .setFooter("© Potor10's Autistic Industries 2021", client.user.avatarURL)
        .setTimestamp());
};

/** @param {import("discord.js").Message} message */
const disable = async message => {
    getOrCreateUser(message.author.id).disabled = true;
    saveUsers();
    await message.reply(`Your profile has been disabled and you are now excluded from random events, type .enable to enable your account`);
    await message.channel.send(new Attachment("https://i.imgur.com/gUHvwFD.png"));
};

/** @param {import("discord.js").Message} message */
const enable = async message => {
    getOrCreateUser(message.author.id).disabled = false;
    saveUsers();
    await message.reply(`Your profile has been enabled`);
    await message.channel.send(new Attachment("https://i.imgur.com/FQ3d0Zk.png"));
};

/** @param {import("discord.js").Message} message */
const ebola = async message => {
    await message.react(BITCONNECT_EMOJI);
    let collected = await message.awaitReactions((reaction, user) => 
                                    reactionFilter(message.author, reaction, user), 
                                    { max: 1, time: 60000, errors: ['time'] })
                                .catch(() => message.reply('You failed to react in time.'));
    if (!collected) return await message.reply('You failed to react in time.');

    let reaction = collected.first();
    if (reaction.emoji.name === "bitconnect") {
        // Find The Role 
        let autismRole = message.guild.roles.find(r => r.name === "YOU HAVE AUTISM!");
        if (!autismRole) return await message.channel.send("Looks like this channel doesn't have" +
                                                            "**YOU HAVE AUTISM!** role");
        if (message.member.roles.has(autismRole.id)){
            return message.reply("YOU ALREADY ARE AUTISTIC");
        } else {
            let success = await message.member.addRole(autismRole)
                                                .catch(() => console.log("Looks like I can't add" +
                                                                    "**YOU HAVE AUTISM!** role"));
            if (success) {
                await message.reply("YOU NOW HAVE AUTISM!");
                console.log(`${message.author.username} is now autistic`);
            }
        }
    }
};

/** @param {import("discord.js").Message} message */
const ping = async message => {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server 
    // (one-way, not round-trip)
    let m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}` + 
              `ms. API Latency is ${Math.round(client.ping)}ms`);
};

/** @param {import("discord.js").Message} message */
const say = async (message, args) => {
    const sayMessage = args.join(" ");
    message.deletable ? message.delete() : console.log(`Looks like I can't delete ` + 
                                                       `message in ${message.channel.name}`);
    await message.channel.send(sayMessage);
};

/** @param {import("discord.js").Message} message */
const awaitEmoji = async (message, text, emoji, option, cancelText) => {
    /** @type {import("discord.js").Message} */
    let emojiText = await message.channel.send(text);
    emojiText.react(emoji);
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(message.author, reaction, user), option)
             .catch(() => { message.channel.send(cancelText); });
};

const COMMANDS = { help, price, sell, buy, daily, ping, spin, 
    reset, say, ebola, enable, disable, profile };

// Chaining Events
client
    .on("ready", () => {
        // Bot Ready
        console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("guildCreate", guild => {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("guildDelete", guild => {
        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("message", async message => {
        // Ignore Bot
        if(message.author.bot) return;

        if (message.attachments.size > 0) {
            if (message.attachments.every(attachIsImage)){
                message.channel.send("Detected Image");
                message.react("409910974607392770");
            }
        }

        // Prefix Matches
        if(message.content.indexOf(prefix) !== 0) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        COMMANDS[command] && COMMANDS[command](message, args);
    });

function attachIsImage(msgAttach) {
    var url = msgAttach.url;
    //True if this url is a png image.
    return url.indexOf("png", url.length - "png".length /*or 3*/) !== -1;
}

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("SIGINT", () => (saveBitconnect(), saveUsers(), process.exit(0)));

// Log In
console.log("Logging In To Princonne Bot");
client.login(token);