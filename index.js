/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, RichEmbed } = require("discord.js");

const { createWorker } = require('tesseract.js');

const PGdb = require('pg').Client;

// Load Config Json with Prefix and Token 
let { token, prefix, db_user, db_host, db_id, db_pass, db_port } = require("./config.json");
prefix = prefix || ".";

// Initialize Discord Client
const client = new Client();

// Initialize PG SQL DB Client
const pgdb = new PGdb({
    user: db_user,
    host: db_host,
    database: db_id,
    password: db_pass,
    port: db_port,
});

const initDB = async () => {
    pgdb.connect();

    const query = `
        DROP TABLE IF EXISTS ATTACKS
        DROP TABLE IF EXISTS STATS
        DROP TABLE IF EXISTS CB

        CREATE TABLE ATTACKS (
            uid int,
            attackDate date,
            attempt1damage int,
            attempt2damage int,
            attempt3damage int,
            cbid int
        );

        CREATE TABLE STATS (
            uid int,
            level int,
            exp int,
            lastMessage int
        );

        CREATE TABLE CB (
            cbid int
        )

        INSERT INTO CB (cbid)
        VALUES (0)
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

const updateCBID = (cbid) => {
    pgdb.connect();

    const query = `
        UPDATE CB
        SET cbid = ${cbid}
    `;

    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`LOG: CB table is successfully updated with value ${cbid}`);
        pgdb.end();
    });
}

const updateAttackDB = (id, date, attempt1, attempt2, attempt3) => {    
    cbid = retrieveCBID();
    pgdb.connect();

    const query = `
        INSERT INTO ATTACKS (uid, attackDate, attempt1damage, attempt2damage, attempt3damage, cbid)
        VALUES (${id}, ${date}, ${attempt1}, ${attempt2}, ${attempt3}, ${cbid})
        ON DUPLICATE KEY UPDATE attempt1damage = VALUES(${attempt1}), attempt2damage = VALUES(${attempt2}), attempt3damage = VALUES(${attempt3}, cbid = VALUES(${cbid}))
    `;

    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`LOG: ATTACKS table is successfully updated with values: ${id}, ${date}, ${attempt1}, ${attempt2}, ${attempt3}, ${cbid}`);
        pgdb.end();
    });
}

const updateStatsDB = (id, level, xp, lastMessage) => {    
    pgdb.connect();

    const query = `
        INSERT INTO STATS (uid, level, exp, lastMessage)
        VALUES (${id}, ${level}, ${xp}, ${lastMessage})
        ON DUPLICATE KEY UPDATE level = VALUES(${level}), exp = VALUES(${xp}, lastMessage = VALUES(${lastMessage}))
    `;

    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`LOG: STATS table is successfully updated with values: ${id}, ${level}, ${xp}`);
        pgdb.end();
    });
}

const retrieveDamageDB = (id, date) => {
    cbid = retrieveCBID();
    pgdb.connect();

    const query = `
        SELECT (SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)) as 'Total'
        FROM ATTACKS
        WHERE cbid = ${cbid} AND uid = ${id}

        SELECT (SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)) as 'Total'
        FROM ATTACKS
        WHERE date = ${date} AND uid = ${id}

        SELECT (SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)) as 'Total'
        FROM ATTACKS
        WHERE uid = ${id}
    `;

    const values = [];
    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return 0;
        }
        for (let row of res.rows) {
            console.log(row);
            values.push(row);
        }
        pgdb.end();
    });

    return values;
}

const retrieveStats = (id) => {
    pgdb.connect();

    const query = `
        CASE
            WHEN NOT EXISTS (SELECT * FROM STATS WHERE uid = ${id}) THEN
                INSERT INTO STATS (uid, level, exp, lastMessage)
                VALUES(${id}, 1, 0, 0)
                SELECT * FROM STATS WHERE uid = ${id}
            ELSE
            SELECT * FROM STATS WHERE uid = ${id}
        END
    `;

    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return 0;
        }
        for (let row of res.rows) {
            console.log(row);
            return row;
        }
        pgdb.end();
    });
}

const retrieveCBID = () => {
    pgdb.connect();

    const query = `
        SELECT cbid
        FROM CB
    `;

    pgdb.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return 0;
        }
        for (let row of res.rows) {
            console.log(row);
            return row;
        }
        pgdb.end();
    });
}

const reactionFilter = (author, reaction, user) => 
        ["bitconnect"].includes(reaction.emoji.name) && user.id === author.id;

const reset = message => {
    if (message.author.id = 154775062178824192) {
        initDB();
        console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset users by ${message.author.username} (${message.author.id})`);
    }
};

const getOrCreateUser = id => {
    userdata = retrieveStats(id);

    return userdata;
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

const COMMANDS = { help, ping, reset, say, profile };

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
            await message.channel.send(`On: ${values[1]}, ${message.author.username} hit for:\n${values[2]}${values[3]}${values[4]}`);
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

initDB();