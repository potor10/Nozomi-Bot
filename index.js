/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, RichEmbed } = require("discord.js");

const { createWorker } = require('tesseract.js');

const PGdb = require('pg').Client;

var parseDbUrl = require("parse-database-url");

// Load Config Json with Prefix and Token 
let { token, prefix } = require("./config.json");
prefix = prefix || ".";

// Initialize Discord Client
const client = new Client();

// Initialize PG SQL DB Client
let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
dbConfig.ssl = { rejectUnauthorized: false };

const initDB = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        DROP TABLE IF EXISTS ATTACKS;
        DROP TABLE IF EXISTS STATS;
        DROP TABLE IF EXISTS CB;

        CREATE TABLE ATTACKS (
            uid varchar,
            attackDate date,
            attempt1damage int,
            attempt2damage int,
            attempt3damage int,
            cbid int
        );

        CREATE TABLE STATS (
            uid varchar,
            level int,
            exp int,
            lastMessage bigint
        );

        CREATE TABLE CB (
            cbid int
        );

        INSERT INTO CB (cbid)
            VALUES (0);
    `;

    try {
        const res = await pgdb.query(query);
        console.log('Table is successfully created');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateCBID = async (cbid) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE CB
            SET cbid = ${cbid};
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: CB table is successfully updated with value ${cbid}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateAttackDB = async (id, date, attempt1, attempt2, attempt3) => {    
    cbid = await retrieveCBID();

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE ATTACKS SET attempt1damage = ${attempt1}, attempt2damage = ${attempt2}, attempt3damage = ${attempt3}, cbid = ${cbid}
            WHERE uid = '${id}' AND attackDate = '${date}';
        INSERT INTO ATTACKS (uid, attackDate, attempt1damage, attempt2damage, attempt3damage, cbid)
            SELECT '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, ${cbid}
            WHERE NOT EXISTS (SELECT 1 FROM ATTACKS WHERE uid = '${id}' AND attackDate = '${date}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ATTACKS table is successfully updated with values: '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, ${cbid}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateStatsDB = async (id, level, xp, lastMessage) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE STATS SET level = ${level}, exp = ${xp}, lastMessage = ${lastMessage} WHERE uid = '${id}';
        INSERT INTO STATS (uid, level, exp, lastMessage)
            SELECT '${id}', ${level}, ${xp}, ${lastMessage}
            WHERE NOT EXISTS (SELECT 1 FROM STATS WHERE uid = '${id}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: STATS table is successfully updated with values: '${id}', ${level}, ${xp}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const retrieveDamageDB = async (id, date) => {
    cbid = await retrieveCBID();

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${cbid} AND uid = '${id}';

        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE attackDate = '${date}' AND uid = '${id}';

        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE uid = '${id}';
    `;

    const values = [];
    try {
        const res = await pgdb.query(query);
        console.log(res);
        console.log(res[0].rows);
        console.log(res[1].rows);
        console.log(res[2].rows);
        values.push(res[0].rows[0].total);
        values.push(res[1].rows[0].total);
        values.push(res[2].rows[0].total);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return values;
}

const retrieveStats = async (id) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        INSERT INTO STATS (uid, level, exp, lastMessage) 
            SELECT '${id}', 1, 0, 0
            WHERE NOT EXISTS (SELECT 1 FROM STATS WHERE uid = '${id}');
    `;

    const selectQuery = `
        SELECT * FROM STATS WHERE uid = '${id}';
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } 

    let output;
    try {
        const res = await pgdb.query(selectQuery);
        output = res.rows[0];
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return output;
}

const retrieveCBID = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT cbid
        FROM CB;
    `;

    let output;
    try {
        const res = await pgdb.query(query);
        output = res.rows[0].cbid;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return output;
}

const reactionFilter = (author, reaction, user) => 
        ["bitconnect"].includes(reaction.emoji.name) && user.id === author.id;

/** @param {import("discord.js").Message} message */
const reset = message => {
    if (message.author.id == 154775062178824192) {
        initDB();
        console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset users by ${message.author.username} (${message.author.id})`);
    }
};

/** @param {import("discord.js").Message} message */
const addXp = async message => {
    let currentTime = Date.now();
    let profile = await retrieveStats(message.author.id);

    if (currentTime - profile.lastmessage > 3000) { //missing 00
        let newXP = profile.exp + Math.floor(Math.random() * 5) + 1;
        console.log(`LOG: ${newXP - profile.exp} XP has been granted to ${message.author.username} (${message.author.id})`);

        let curLevel = 1 + Math.floor(Math.sqrt(newXP));
        if (curLevel > profile.level) {
            // Level up!
            profile.level = curLevel;
            message.reply(`You've leveled up to level **${curLevel}**!`);
            console.log(`LOG: ${message.author.username} (${message.author.id}) has leveled up to ${curLevel}`);
        }
        updateStatsDB(message.author.id, curLevel, newXP, currentTime)
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

const setclanbattle = (message) => {
    let currentCBID = retrieveCBID();
    let newCBID = parseFirstArgAsInt(message, currentCBID);
    updateCBID(newCBID);
    message.reply(`Current Clan Battle Identification Number Set To: ${newCBID}`)
}

/** @param {import("discord.js").Message} message */
const profile = async message => {
    
    let profileUser = message.mentions.members.first() || message.author;
    let profileData = await retrieveStats(profileUser.id);
    const sqlDate = (new Date()).toLocaleString("en-US");

    const pad = (num) => { 
        return ('00'+num).slice(-2) 
    };
    
    let date = new Date();
    date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

    console.log(sqlDate);
    let profileDamage = await retrieveDamageDB(profileUser.id, sqlDate);

    await message.channel.send(new RichEmbed()
        .setURL("https://twitter.com/priconne_en")
        .setColor(3447003)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setThumbnail(profileUser.avatarURL)
        .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
        .setDescription("Displaying Profile.")
        .addField("Level", profileData.level)
        .addField("Damage Dealt This Clan War", profileDamage[0])
        .addField("Damage Dealt Today", profileDamage[1])
        .addField("Total Damage Dealt", profileDamage[2])
        .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL)
        .setTimestamp());
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

const COMMANDS = { help, ping, reset, say, profile, setclanbattle };

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
            left: Math.floor(980/2208 * width),
            top: Math.floor(270/1242 * height),
            width: Math.floor(700/2208 * width),
            height: Math.floor(80/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(345/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(100/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(590/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(100/1242 * height),
        },
        {
            left: Math.floor(1950/2208 * width),
            top: Math.floor(835/1242 * height),
            width: Math.floor(140/2208 * width),
            height: Math.floor(100/1242 * height),
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
            } else if (i==0) {
                await message.react('✅');
            }
            values.push(text);
        }

        if (isClan) {
            console.log(values);

            let intAttack1 = await parseFirstArgAsInt(values[4].split('\n', 1)[0], 0);
            let intAttack2 = await parseFirstArgAsInt(values[3].split('\n', 1)[0], 0);
            let intAttack3 = await parseFirstArgAsInt(values[2].split('\n', 1)[0], 0);
            
            const pad = (num) => { 
                return ('00'+num).slice(-2) 
            };
            
            let date;
            for (i = 0; i < values[1].length - 6; i++) {
                date = Date.parse(values[1].substr(i, 6));
                if(!isNaN(date)){
                    console.log(`LOG: Date Parsed, Found ${date}`);
                    break;
                }
            }

            if (!isNaN(date)) {
                let newdate = new Date(date);
                newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());
                await updateAttackDB(message.author.id, newdate, intAttack1, intAttack2, intAttack3);

                await message.channel.send(new RichEmbed()
                .setURL("https://twitter.com/priconne_en")
                .setColor("#0099ff")
                .setAuthor(client.user.username, client.user.avatarURL)
                .setTitle(`${message.author.displayName||message.author.username}'s attack`)
                .setDescription(`on ${date}`)
                .addField("Attempt 1", intAttack1)
                .addField("Attempt 2", intAttack2)
                .addField("Attempt 3", intAttack3)
                .addField("Total Damage Dealt For This Day", intAttack1 + intAttack2 + intAttack3)
                .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL)
                .setTimestamp());
            }
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

        await addXp(message);

        if (message.attachments.size > 0) {
            if (message.attachments.every(getOcrImage)){
                await returnOCR(message);
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
process.on("SIGINT", () => (process.exit(0)));

// Log In
console.log("Logging In To Princonne Bot");
client.login(token);

initDB();