/**
 * @description Autistic Discord Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, RichEmbed } = require("discord.js");

// Initialize Discord Client
const client = new Client();

const fs = require("fs");
/** @type {{bitconnect:Number,money:Number,kidneys:Number,credit_card:Number,level:Number,lastClaim:Number,exp:Number,disabled:Number}[]} */
let userdata = JSON.parse(fs.readFileSync("./userdata.json", "utf8"));
/** @type {{time:Number,price:Number,flucSkew:Number,flucAmt:Number}[]} */
let bitconnectdata = JSON.parse(fs.readFileSync("./bitconnect.json", "utf8"));

// Bitconnect Constants
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

const updateBitconnect = () => {
    if (!bitconnectdata.length) {
        resetBitconnect();
        return 0;
    } else if (bitconnectdata.length > 300) {
        bitconnectdata = bitconnectdata.slice(~~(bitconnectdata.length / 2));
    }
    
    let latestData = bitconnectdata.slice(-1)[0];
    
    let remIter = Math.floor((Date.now() - latestData.time) / updateVal);
    //console.log(remIter);

    // Looks like cancer I don't want to touch 😂
    while(remIter > 0) {
        
        latestData.price += Math.floor((Math.random() * latestData.flucAmt) - latestData.flucAmt * latestData.flucSkew);
        
        if (latestData.price <= 0) {
            marketCrash = true;
            remIter = 0;
            break;
        }
    
        let flucSkewCng = -((Math.random() * (latestData.flucSkew - 0.5)) * 0.1) +
                            ((Math.random() - 0.5) * 0.01);
        let flucAmtCng = -((Math.random() * (latestData.flucAmt - 10)) * 0.2) +
                            ((Math.random() - 0.5) * 0.1);
        
        if (timeUpdate != 0 && latestData.time > timeUpdate) {
            //console.log("Zuccsess");
            flucSkewCng += marketUpdateSkew;
            flucAmtCng += marketUpdateAmt;
            timeUpdate = 0;
            marketUpdateSkew = 0;
            marketUpdateAmt = 0;
        }
        
        let randomEvent = Math.floor(Math.random() * 100);
        switch (randomEvent) {
            case 0:
                flucSkewCng += 4;
                break;
            case 1:
                flucSkewCng -= 3;
                break;
            case 2:
                flucSkewCng += 4;
                flucAmtCng += 3;
                break;
        }
        
        // console.log("flucSkeyCng", flucSkewCng);
        // console.log("flucAmtCng", flucAmtCng);
        
        bitconnectdata.push({
            time: latestData.time + updateVal,
            price: latestData.price,
            flucSkew: latestData.flucSkew + flucSkewCng, 
            flucAmt: latestData.flucAmt + flucAmtCng
        });
        remIter--;
    }
    saveBitconnect();
    return bitconnectdata.length - 1;
};

const reactionFilter = (author, reaction, user) => 
        ["bitconnect"].includes(reaction.emoji.name) && user.id === author.id;

const saveUsers = () => fs.writeFileSync("./userdata.json", 
                                    JSON.stringify(userdata, null, 4));

const getOrCreateUser = id => {
    if (!userdata[id]) userdata[id] = {
        bitconnect: 0,
        money: 0,
        kidneys: 0,
        credit_card: 0,
        level: 100,
        lastClaim: 0,
        exp: 1,
        disabled: false
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

const daily = message => {
    let currentTime = Date.now();

    let profile = getOrCreateUser(message.author.id);

    if (currentTime - profile.lastClaim < 7200000) {
        let timeLeft = (((7200000 - currentTime + profile.lastClaim) / 1000) / 60);
        message.channel.send(`${timeLeft.toFixed(2)} minutes before next claim`);
    } else {
        profile.bitconnect++;
        profile.exp++;
        profile.lastClaim = currentTime;
        message.channel.send(`Success, You Have ${profile.bitconnect} Bitconnect`);

        let curLevel = 100 - Math.floor(Math.sqrt(profile.exp));
        console.log(`Current Level of ${message.author.username}: ${curLevel}`);
        if (curLevel < profile.level) {
            // Level up!
            profile.level = curLevel;
            message.reply(`You've leveled down to level **${curLevel}**!`);
        }
        saveUsers();
    }
};

const drawTable = (displaySize, index) => {

    const tableHeight = 20;
    let size = Math.min(bitconnectdata.length, displaySize);
    let trimData = bitconnectdata.slice(index - size, index + 1)
                                 .map(data => data.price);
                                 
    let priceMin = Math.min(...trimData);
    let priceMax = Math.max(...trimData);
    
    // Transpose Matrix, stolen from stack
    const T = m => m[0].map((_, i) => m.map(r => r[i]));

    let table = trimData.map(price => {
        let column = Array.from({ length: tableHeight }, () => " ");
        let scaledPos = Math.floor((price - priceMin) / (priceMax - priceMin) * 20);
        column[20 - scaledPos] = "x";
        return column;
    });
    
    let width = trimData.length;
    let preText = width > 30 ? `${width * 6} Seconds Ago` : `-${width * 6}`;               
    let postText = `Current Time`;
    let textDif = width - (preText.length + postText.length);
    
    return "```\n" + 
        // Rows
        T(table).map((row, y) => row.join("") +
            `│ ${Math.ceil(priceMax - y * (priceMax - priceMin) / 20)}`).join("\n") +
        // Bottom
        "\n" + `━`.repeat(width) + 
        // Corner
        "┙\n" +
        // Footer
        preText + "\x20".repeat(Math.abs(textDif)) + postText + "\n```";
};

const parseFirstArgAsInt = (args, defaultValue) => {
    if (!Array.isArray(args)) return defaultValue;
    if (args.length) {
        let parseAmt = parseInt(args.shift().toLowerCase(), 10);
        if (!isNaN(parseAmt) && parseAmt > 0) return parseAmt;
    } else return defaultValue;
};

/** @param {import("discord.js").Message} message */
const price = async (message, args) => {
    let displaySize = parseFirstArgAsInt(args, 50);
    if (!displaySize || displaySize < 10 || displaySize > 60) {
        await message.channel.send("Please enter a number value for <size> " + 
                "between 10 and 60 (inclusive), default value has been selected");
        return;
    }
    
    let index = updateBitconnect();
    await message.channel.send(drawTable(displaySize, index));
    await message.channel.send(`The Current Price For A Bitconnect Is: **\$${bitconnectdata[index].price}**`);
    return index;
};

/** @param {import("discord.js").Message} message */
const buy = async (message, args) => {
    // If crash rip
    if (await checkCrash(message)) return;

    let transactAmt = parseFirstArgAsInt(args, 1);
    if (!transactAmt) return message.channel.send("Please enter a proper value for <amt>");
    let profile = getOrCreateUser(message.author.id);

    let index = await price(message);
    let currentPrice = bitconnectdata[index].price;

    let collected = await awaitEmoji(message, 
        `Buying **${transactAmt}** Bitconnect Will Cost` + 
        ` **${transactAmt * currentPrice}**, React To Confirm`,
        BITCONNECT_EMOJI, { max: 1, time: 20000, errors: ['time'] }, 
        'The order has been cancelled.');

    if (!collected) return;
    let reaction = collected.first();

    if (reaction.emoji.name === "bitconnect") {
        if (profile.money < (transactAmt * currentPrice)) {
            message.channel.send("You do not have enough money");
        } else {
            profile.money -= (transactAmt * currentPrice);
            profile.bitconnect += transactAmt;
            bitconnectdata.slice(-1)[0].flucSkew += Math.log(transactAmt / 3) * 0.3;
            bitconnectdata.slice(-1)[0].flucAmt += Math.log(transactAmt);

            saveBitconnect();
            saveUsers();
            
            await message.channel.send(`You have bought **${transactAmt}** bitconnect.\n` + 
                                       `You have \$**${profile.money}** left.`);
        }
    }
};

/** @param {import("discord.js").Message} message */
const sell = async (message, args) => {
    // If crash rip
    if (await checkCrash(message)) return;

    let transactAmt = parseFirstArgAsInt(args, 1);
    if (!transactAmt) return message.channel.send("Please enter a proper value for <amt>");
    let profile = getOrCreateUser(message.author.id);

    let index = await price(message);
    let currentPrice = bitconnectdata[index].price;
    
    let collected = await awaitEmoji(message, 
        `Selling **${transactAmt}** Bitconnect For ` + 
        `**${transactAmt * currentPrice}**, React To Confirm`,
        BITCONNECT_EMOJI, { max: 1, time: 20000, errors: ['time'] }, 
        'The order has been cancelled.');

    if (!collected) return;
    const reaction = collected.first();

    if (reaction.emoji.name === "bitconnect") {
        if (profile.bitconnect < transactAmt) {
            await message.channel.send("You do not have enough bitconnect");
        }
        else {
            profile.money += (transactAmt * currentPrice);
            profile.bitconnect -= transactAmt;
            latestData.flucSkew -= Math.log(transactAmt / 3) * 0.3;
            latestData.flucAmt += Math.log(transactAmt);
            saveBitconnect();
            saveUsers();
        
            await message.channel.send(`You have sold **${transactAmt}** bitconnect.\n` + 
                                       `You have **${profile.bitconnect}** bitconnect left.`);
        }
    }
};

/** @param {import("discord.js").Message} message */
const reset =  async message => {
    resetBitconnect();
    await message.reply("Bitconnect Data Has Been Reset.");
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
        .addField("Bitconnect", profileData.bitconnect)
        .addField("Money", profileData.money)
        .addField("Kidneys", profileData.kidneys)
        .addField("Credit-Card Number", profileData.credit_card)
        .addField("Disabled", profileData.disabled)
        .setFooter("© Potor10's Autistic Industries 2019", client.user.avatarURL)
        .setTimestamp());
};

/** @param {import("discord.js").Message} message */
const spin = async message => {
    let profile = getOrCreateUser(message.author.id);

    if (profile.disabled) {
        return await message.reply("You are disabled so you are excluded from using this command");
    }

    let collected = await awaitEmoji(message, 
                "This Will Consume 1 Bitconnect, React To Confirm", BITCONNECT_EMOJI,
                { max: 1, time: 20000, errors: ['time'] }, 'The order has been cancelled.');

    if (!collected) return;
    const reaction = collected.first();

    if (reaction.emoji.name === "bitconnect") {
        if (profile.bitconnect < 1) {
            return await message.channel.send("You do not have enough bitconnect");
        }
        /** @type {import("discord.js").GuildMember} */
        let randMem;
        while (!randMem || !userdata[randMem.id]) randMem = message.guild.members.random();
                
        profile.bitconnect--;
        
        let scenario = Math.floor(Math.random() * 3);
        if (scenario === 0) {
            message.channel.send(`**${randMem.user.username}** has developed autism and lost brain cells resulting in a gain of 10 bitconnect`);
            userdata[randMem.id].bitconnect += 10;
        } else if (scenario === 1) {
            message.channel.send(`**${randMem.user.username}** had a literal stroke of genius and has lost all bitconnect`);
            userdata[randMem.id].bitconnect = 0;
        } else if (scenario === 2) {
            message.channel.send(`**Hype in the BITCONNECT MARKET!** expect prices to **RISE**!`);
            marketUpdateSkew = 15;
            marketUpdateAmt = 100;
            timeUpdate = Date.now();
            console.log("marketUpdateAmt", marketUpdateAmt);
            console.log("marketUpdateSkew", marketUpdateSkew);
            console.log("timeUpdate", timeUpdate);
        }
    }
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
        client.user.setActivity(`AUTISM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("guildCreate", guild => {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
        client.user.setActivity(`AUTISM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("guildDelete", guild => {
        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
        client.user.setActivity(`AUTISM HAS INFECTED ${client.guilds.size} SERVERS`);
    })
    .on("message", async message => {
        // Ignore Bot
        if(message.author.bot) return;

        if (message.content.toLowerCase().includes("autism")) {
            message.channel.send("YOU HAVE AUTISM");
            message.channel.send("👀");
            message.channel.send("<:pog:471222524320022528>");
            message.react("409910974607392770");
            return;
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
process.on("SIGINT", () => (saveBitconnect(), saveUsers(), process.exit(0)));

// Log In
console.log("Logging In");
client.login(token);