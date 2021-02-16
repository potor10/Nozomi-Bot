/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, RichEmbed } = require("discord.js");

// Initialize Discord Client
const client = new Client();

// Load Config Json with Prefix and Token 
let { token, prefix } = require("./config.json");
prefix = prefix || ".";

const fs = require("fs");
/** @type {{clanDamage:Number,dailyDamage:Number,totalDamage:Number,level:Number,exp:Number,rank:Number, lastMessage:Number}[]} */
let userdata = JSON.parse(fs.readFileSync("./userdata.json", "utf8"));

// Rad Dream Constants
const updateVal = 6000;
let marketCrash = false;
let marketUpdateSkew = 0;
let marketUpdateAmt = 0;
let timeUpdate = 0;

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

const resetusers = message => {
    if (message.author.id = 154775062178824192) {
        for (let x in userdata) {
            userdata[x].clanDamage = 0;
            userdata[x].dailyDamage = 0;
            userdata[x].totalDamage = 0;
            userdata[x].level = 1;
            userdata[x].exp = 0;
            userdata[x].rank = 0;
            userdata[x].lastMessage = 0;
        }
        saveUsers();
        console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset users by ${message.author.username} (${message.author.id})`);
    }
};

const getOrCreateUser = id => {
    if (!userdata[id]) userdata[id] = {
        clanDamage: 0,
        dailyDamage: 0,
        totalDamage: 0,
        level: 1,
        exp: 0,
        rank: 0,
        lastMessage: 0
    };
    return userdata[id];
};

/** @param {import("discord.js").Message} message */
const addXp = message => {
    let currentTime = Date.now();
    let profile = getOrCreateUser(message.author.id);

    if (currentTime - profile.lastMessage > 30000) { //missing 0
        profile.exp += 1;
        profile.lastMessage = currentTime;

        console.log(`LOG: 1 XP has been granted to ${message.author.username} (${message.author.id})`);

        let curLevel = 1 + Math.floor(Math.sqrt(profile.exp));
        if (curLevel > profile.level) {
            // Level up!
            profile.level = curLevel;
            message.reply(`You've leveled up to level **${curLevel}**!`);
            console.log(`LOG: ${message.author.username} (${message.author.id}) has leveled up to ${curLevel}`);
        }
        saveUsers();
    }
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

const COMMANDS = { help, ping, resetusers, say, profile };

const getOcrImage = msgAttach => {
    let url = msgAttach.url;

    let isPng = url.indexOf("png", url.length - "png".length);
    let isJpg = url.indexOf("jpg", url.length - "jpg".length);

    isImage = false;
    if ((isPng !== -1) || (isJpg !== -1)) {
        isImage = true;
    }

    return isImage;
}

const { createWorker } = require('tesseract.js');

/** @param {import("discord.js").Message} message */
const returnOCR = async message => {
    message.attachments.forEach(async attachment => {
        const worker = createWorker({
            //logger: m => console.log(m), // Add logger here
          });

        let height = attachment.height;
        let width = attachment.width;

        const rectangles = [
        {
            left: Math.floor(1647/2208 * width),
            top: Math.floor(70/1242 * height),
            width: Math.floor(187/2208 * width),
            height: Math.floor(40/1242 * height),
        },
        {
            left: Math.floor(1016/2208 * width),
            top: Math.floor(285/1242 * height),
            width: Math.floor(600/2208 * width),
            height: Math.floor(50/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(385/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(39/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(634/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(39/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(875/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(39/1242 * height),
        },
        ];
          
        console.log(attachment.url);
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const values = [];
        isClan = true;
        for (let i = 0; i < rectangles.length; i++) {
            const { data: { text } } = await worker.recognize(attachment.url, {rectangle: rectangles[i]} );
            if (i==0 && text.localeCompare("Trial Run\n") != 0) {
                isClan = false;
                console.log(`Not Clan War but instead:${text}`);
                break;
            }
            values.push(text);
        }

        if (isClan) {
            await message.reply(`The text in the image is: ${values}`);
            console.log(values);
        }
        await worker.terminate();
    });
}

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

        addXp(message);

        if (message.attachments.size > 0) {
            if (message.attachments.every(getOcrImage)){
                message.channel.send("Detected Image");
                message.react("409910974607392770");
                returnOCR(message);
            }
        }

        // Prefix Matches
        if(message.content.indexOf(prefix) !== 0) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        COMMANDS[command] && COMMANDS[command](message, args);
    });

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("SIGINT", () => (saveUsers(), process.exit(0)));

// Log In
console.log("Logging In To Princonne Bot");
client.login(token);