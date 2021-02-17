/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

const { Client, Attachment, MessageEmbed } = require("discord.js");
const { createWorker } = require('tesseract.js');
const PGdb = require('pg').Client;
const parseDbUrl = require("parse-database-url");

const cheerio = require('cheerio');
const got = require("got");

const { Canvas, Image } = require('canvas');
const fs = require('fs');

// Load Config Json with Prefix and Token 
let { prefix, oneStarRate, twoStarRate, threeStarRate } = require("./config.json");
prefix = prefix || ".";

// Initialize Discord Client
const client = new Client();

// Initialize PG SQL DB Client
let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
dbConfig.ssl = { rejectUnauthorized: false };

const initGachaDB = async () => {

    const url1star = 'https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85';
    const url2star = 'https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85';
    const url3star = 'https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85%E2%98%85';

    const findTable = '.table > tbody > tr > td > a';
    const findImg = '.ie5 > table > tbody > tr > .style_td img';

    const charArray1star = await webScrape(url1star, findTable, findImg);
    const charArray2star = await webScrape(url2star, findTable, findImg);
    const charArray3star = await webScrape(url3star, findTable, findImg);

    for (let i = 0; i < charArray1star.length; i++) {
        await updateCharDB(charArray1star[i].name, charArray1star[i].thumbnailURL, charArray1star[i].fullImageURL, 1);
    }

    for (let i = 0; i < charArray2star.length; i++) {
        await updateCharDB(charArray2star[i].name, charArray2star[i].thumbnailURL, charArray2star[i].fullImageURL, 2);
    }

    for (let i = 0; i < charArray3star.length; i++) {
        await updateCharDB(charArray3star[i].name, charArray3star[i].thumbnailURL, charArray3star[i].fullImageURL, 3);
    }
}

const webScrape = async (url, findTable, findImg) => {
    let returnArray = [];

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Data From Units From: ${url}`);

        let firstClass = $('.ie5').first().html();
        $ = cheerio.load(firstClass);

        let rows = $(findTable);

        for (let i = 0; i < rows.length; i++) {
            let imgTitle = $('img', rows[i]).attr('title');
            let idxName = imgTitle.lastIndexOf('★');

            if (idxName != -1) {
                let thumbnailURL = $('img', rows[i]).attr('src');
                let characterName = imgTitle.substr(idxName + 1);

                let characterInfo = await getGachaData(rows[i].attribs.href, thumbnailURL, findImg, characterName);
                returnArray.push(characterInfo);
            }
        }

        return returnArray;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

const getGachaData = async (href, thumbnailURL, findImg, characterName) => {
    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullImageURL = innerPage(findImg).first().attr('src');

        let characterInfo = {
            name: characterName,
            thumbnailURL: thumbnailURL,
            fullImageURL: fullImageURL
        } 

        return characterInfo;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

const initDB = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        DROP TABLE IF EXISTS ATTACKS;
        DROP TABLE IF EXISTS STATS;
        DROP TABLE IF EXISTS CB;
        DROP TABLE IF EXISTS COLLECTION;

        CREATE TABLE ATTACKS (
            uid varchar NOT NULL,
            attackDate date NOT NULL,
            attempt1damage int DEFAULT 0,
            attempt2damage int DEFAULT 0,
            attempt3damage int DEFAULT 0,
            cbid int NOT NULL
        );

        CREATE TABLE STATS (
            uid varchar NOT NULL,
            level int DEFAULT 1,
            exp int DEFAULT 0,
            lastMessage bigint DEFAULT 0,
            jewels int DEFAULT 0,
            tears int DEFAULT 0
        );

        CREATE TABLE CB (
            cbid int DEFAULT 0
        );

        CREATE TABLE COLLECTION (
            uid varchar NOT NULL,
            charName varchar NOT NULL
        );

        INSERT INTO CB (cbid)
            VALUES (0);
    `;

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Table is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const initCharDB = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS CHARDB;
    
        CREATE TABLE CHARDB (
            charName varchar NOT NULL,
            thumbnailURL varchar NOT NULL,
            fullImageURL varchar NOT NULL,
            starLevel int NOT NULL
        );
    `

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Char DB is successfully reset');
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

const updateStatsDB = async (id, level, xp, lastMessage, jewels, tears) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE STATS SET level = ${level}, exp = ${xp}, lastMessage = ${lastMessage}, jewels = ${jewels}, tears = ${tears}
            WHERE uid = '${id}';
        INSERT INTO STATS (uid, level, exp, lastMessage, jewels, tears)
            SELECT '${id}', ${level}, ${xp}, ${lastMessage}, ${jewels}, ${tears}
            WHERE NOT EXISTS (SELECT 1 FROM STATS WHERE uid = '${id}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: STATS table is successfully updated with values: '${id}', ${level}, ${xp}, ${jewels}, ${tears}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateCharDB = async (charName, thumbnailURL, fullImageURL, starLevel) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE CHARDB SET thumbnailURL = '${thumbnailURL}', fullImageURL = '${fullImageURL}', starLevel = ${starLevel}
            WHERE charName = '${charName}';
        INSERT INTO CHARDB (charName, thumbnailURL, fullImageURL, starLevel)
            SELECT '${charName}', '${thumbnailURL}', '${fullImageURL}', ${starLevel}
            WHERE NOT EXISTS (SELECT 1 FROM CHARDB WHERE charName = '${charName}');
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const addCollection = async (id, charName) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        INSERT INTO COLLECTION (uid, charName)
            SELECT '${id}', '${charName}'
            WHERE NOT EXISTS (SELECT 1 FROM COLLECTION WHERE uid = '${id}' AND charName = '${charName}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ${charName} was successfully added to ${id}'s collection`);
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
        console.log(`LOG: Obtained Damage Values For ${id}`);
        
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
        INSERT INTO STATS (uid, level, exp, lastMessage, jewels, tears) 
            SELECT '${id}', 1, 0, 0, 0, 0
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

const retrieveGacha = async (starLevel) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const selectQuery = `
        SELECT * FROM CHARDB WHERE starLevel = ${starLevel};
    `;

    let output;
    try {
        const res = await pgdb.query(selectQuery);
        output = res.rows;
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

const retrieveCollection = async (id) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT charName FROM COLLECTION
            WHERE uid = ${id};
    `;

    let output = [];
    try {
        const res = await pgdb.query(query);
        for (let row in res.rows) {
            output.push(row.charName);
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return output;
}

const checkCollection = async (id, charName) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT charName FROM COLLECTION
            WHERE uid = '${id}' and charName = '${charName}';
    `;

    let output = true;
    try {
        const res = await pgdb.query(query);
        console.log(res.rows);
        if (res.rows.length == 0) {
            output = false;
        }
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
const awaitEmoji = async (message, text, emoji, option, cancelText) => {
    /** @type {import("discord.js").Message} */
    let emojiText = await message.channel.send(text);
    emojiText.react(emoji);
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(message.author, reaction, user), option)
             .catch(() => { message.channel.send(cancelText); });
};

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
const resetchardb = message => {
    if (message.author.id == 154775062178824192) {
        initCharDB();
        console.log(`LOG: CharDB have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset CharDB by ${message.author.username} (${message.author.id})`);
    }
}

/** @param {import("discord.js").Message} message */
const updategacha = message => {
    if (message.author.id == 154775062178824192) {
        initGachaDB();
        console.log(`LOG: CharDB have been initialized by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to initialize CharDB by ${message.author.username} (${message.author.id})`);
    }
}


/** @param {import("discord.js").Message} message */
const addXp = async message => {
    let currentTime = Date.now();
    let profile = await retrieveStats(message.author.id);

    if (currentTime - profile.lastmessage > 3000) { //missing 00
        let newXP = profile.exp + Math.floor(Math.random() * 5) + 1;
        console.log(`LOG: ${newXP - profile.exp} XP has been granted to ${message.author.username} (${message.author.id})`);

        let curJewel = profile.jewels;

        let curLevel = 1 + Math.floor(Math.sqrt(newXP));
        if (curLevel > profile.level) {
            // Level up!
            profile.level = curLevel;

            let randomNozomi = [
                'https://static.wikia.nocookie.net/princess-connect/images/4/45/Cute-human-longsword-sakurai_nozomi_rare_gacha001-0-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/1/1c/Nozomi-idolastrum-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/6/63/Nozomi-christmas-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/89/Cute-human-longsword-sakurai_nozomi_rare_gacha001-1-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/83/Cute-human-longsword-sakurai_nozomi_normal_start-1-normal.png'
            ]

            let nozomiIdx = Math.floor(Math.random() * 5);

            let earnedJewels = curLevel * 10 * (Math.floor(Math.random() * 50) + 1);
            curJewel = earnedJewels + curJewel;
            await message.channel.send(new MessageEmbed()
                .setURL("https://twitter.com/priconne_en")
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setThumbnail(randomNozomi[nozomiIdx])
                .setTitle(`${message.author.displayName||message.author.username}'s Level Up!`)
                .setDescription(`You've leveled up to level **${curLevel}**! \n\n` +
                    `Congrats, you've earned ${earnedJewels} <:jewel:811495998194450454>`)
                .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
                .setTimestamp());

            console.log(`LOG: ${message.author.username} (${message.author.id}) has leveled up to ${curLevel}`);
        }
        updateStatsDB(message.author.id, curLevel, newXP, currentTime, curJewel, profile.tears);
    }
};


// Commands
const help = message => message.author.send(`I'll be counting on you, so let's work together until I can become a top idol, okay? Ahaha, from now on, I'll be in your care! \n\n` + 
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

const clanbattle = async (message, args) => {
    let currentCBID = await retrieveCBID();
    let newCBID = parseFirstArgAsInt(args, currentCBID);
    if (currentCBID != newCBID) {
        if (message.author.id == 154775062178824192) {
            await updateCBID(newCBID);
            await message.channel.send(`Current Clan Battle Identification Number Set To: ${newCBID}`);
        } else {
            message.channel.send(`You do not have the permission to use this`);
        }
    } else {
        await message.channel.send(`Current Clan Battle Identification Number Is: ${currentCBID}`);
    }
    
}

/** @param {import("discord.js").Message} message */
const profile = async message => {
    
    let profileUser = message.author;
    let avatarUser = profileUser.avatarURL();
    if (message.mentions.members.first()) {
        profileUser =  message.mentions.members.first();
        avatarUser = profileUser.user.avatarURL();
    }
    let profileData = await retrieveStats(profileUser.id);

    const pad = (num) => { 
        return ('00'+num).slice(-2) 
    };
    
    let date = new Date();
    date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

    let profileDamage = await retrieveDamageDB(profileUser.id, date);

    let randomStatus = Math.floor(Math.random() * 5);
    let statusStrings = [
        "A Dapper Fellow <:coolnozomi:811498063527936031>",
        "Empty In Mana <:mana:811498063515353149>",
        "Drowning In Tears <:tears:811495998450565140>",
        "Pulling Literal Garbage <:garbage:811498063427928086>",
        "Out Of Shape <:stamina:811495998328930314>"
    ];

    await message.channel.send(new MessageEmbed()
        .setURL("https://twitter.com/priconne_en")
        .setColor(3447003)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setThumbnail(avatarUser)
        .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
        .setDescription(statusStrings[randomStatus])
        .addField("Level <:starico:811495998479532032>", profileData.level)
        .addFields(
            { name: "Dealt This War <:bluesword:811495998479925268>", value: profileDamage[0], inline: true },
            { name: "Dealt Today <:greensword:811495998374805514> ", value: profileDamage[1], inline: true },
            { name: "Total Dealt <:patk:811495998156439563>", value: profileDamage[2], inline: true },
            { name: "Jewels <:jewel:811495998194450454> ", value: profileData.jewels, inline: true },
            { name: "Tears <:tears:811495998450565140>", value: profileData.tears, inline: true },
        )
        .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
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

function loadImage (url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
  
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        img.src = url;
    })
}

const rollgacha = async (message) => {

    let profile = await retrieveStats(message.author.id);
    console.log(profile);
    let jewelCost = 0;

    if (profile.jewels >= jewelCost) {

        let char3star = await retrieveGacha(3);
        let char2star = await retrieveGacha(2);
        let char1star = await retrieveGacha(1);

        console.log(char2star);

        let rollString = '';

        let embedRoll = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
            .setDescription(`${rollString}`)
            .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
            .setTimestamp();

        let rollResults = await message.channel.send(embedRoll);
        
        let timesRun = 0;
        let silverCount = 0;
        let tearsObtained = 0;
        let newUnits = 0;

        let obtainedImages = [];
        let isDupe = [];

        let interval = setInterval(async () => {
            if(timesRun === 10){
                clearInterval(interval);

                await updateStatsDB(message.author.id, profile.level, profile.exp, profile.lastmessage, 
                    profile.jewels - jewelCost, profile.tears + tearsObtained);
                
                let sizX = 121;
                let sizY = 121;

                let tearSRC = await loadImage(
                    `https://media.discordapp.net/emojis/811495998450565140.png?width=${sizX}&height=${sizY}`);
                
                var canvas = new Canvas(sizX * 5, sizY * 2);
                var ctx = canvas.getContext('2d');
                
                let x = 0;
                let y = 0;
                
                for (let i = 0; i < obtainedImages.length; i++) {
                    ctx.drawImage(obtainedImages[i], x, y, sizX, sizY);

                    x+= sizX;
                    if (i == 4) {
                        x = 0;
                        y += sizY;
                    }
                }

                x = 0;
                y = 0;
                ctx.globalAlpha = 0.6;

                for (let i = 0; i < isDupe.length; i++) {
                    if (isDupe[i]) {
                        ctx.drawImage(tearSRC, x, y, sizX, sizY);
                    }

                    x+= sizX;
                    if (i == 4) {
                        x = 0;
                        y += sizY;
                    }
                }

                const out = fs.createWriteStream('./test.png');
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                out.on('finish', () =>  {
                        console.log('LOG: The PNG agregate file was created.');

                        let tearsStr = `You have earned ${tearsObtained} <:tears:811495998450565140>`;

                        if (newUnits > 0) {
                            tearsStr += ` and have obtained ${newUnits} new characters!`
                        }

                        let combinedRoll = new MessageEmbed()
                            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                            .setAuthor(client.user.username, client.user.avatarURL())
                            .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                            .setDescription(tearsStr)
                            .attachFiles(['./test.png'])
                            .setImage('attachment://test.png')
                            .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
                            .setTimestamp();
                        
                        rollResults.delete();
                        message.channel.send(combinedRoll);
                    }
                );
            } else if (timesRun < 10) {            
                let rarityRolled = Math.floor(Math.random() * (oneStarRate + twoStarRate + threeStarRate));
                if (rarityRolled < threeStarRate) {
                    let randomUnit = Math.floor(Math.random() * char3star.length);
                    rollString += '<:poggerona:811498063578529792>';
                    
                    console.log(randomUnit);
                    console.log(char3star[randomUnit].charname);
                    if (await checkCollection(message.author.id, char3star[randomUnit].charname)) {
                        tearsObtained += 50;
                        isDupe[timesRun] = 1;

                    } else {
                        await addCollection(message.author.id, char3star[randomUnit].charname);
                        isDupe[timesRun] = 0;
                        newUnits++;
                    }

                    let obtainedImage = await loadImage(char3star[randomUnit].thumbnailurl);
                    obtainedImages.push(obtainedImage);
                } else if (rarityRolled < (threeStarRate + twoStarRate) || silverCount == 9) {
                    let randomUnit = Math.floor(Math.random() * char2star.length);
                    rollString += '<:bitconnect:811498063641837578>';

                    console.log(randomUnit);
                    console.log(char3star[randomUnit].charname);
                    if (await checkCollection(message.author.id, char2star[randomUnit].charname)) {
                        tearsObtained += 10;
                        isDupe[timesRun] = 1;

                    } else {
                        await addCollection(message.author.id, char2star[randomUnit].charname);
                        isDupe[timesRun] = 0;
                        newUnits++;
                    }

                    let obtainedImage = await loadImage(char2star[randomUnit].thumbnailurl);
                    obtainedImages.push(obtainedImage);
                } else {
                    silverCount++;

                    let randomUnit = Math.floor(Math.random() * char1star.length);
                    rollString += '<:garbage:811498063427928086>';

                    console.log(randomUnit);
                    console.log(char3star[randomUnit].charname);
                    if (await checkCollection(message.author.id, char1star[randomUnit].charName)) {
                        tearsObtained += 1;
                        isDupe[timesRun] = 1;

                    } else {
                        await addCollection(message.author.id, char1star[randomUnit].charName);
                        isDupe[timesRun] = 0;
                        newUnits++;
                    }

                    let obtainedImage = await loadImage(char1star[randomUnit].thumbnailurl);
                    obtainedImages.push(obtainedImage);
                }

                embedRoll.setDescription(`${rollString}`);
                rollResults.edit(embedRoll);
            } else {
                clearInterval(interval);
            }
            timesRun += 1;
        }, 2000); 
    } else {
        let reminder = await message.reply(`You Need At Least 1500 <:jewel:811495998194450454> To Roll! \n` +
            `You Are Missing ${1500-profile.jewels} <:jewel:811495998194450454> `);
        setTimeout(() => { reminder.delete();}, 5000);
    }
}

const getOcrImage = msgAttach => {
    let url = msgAttach.url;

    let isPng = url.indexOf("png", url.length - "png".length);
    let isJpg = url.indexOf("jpg", url.length - "jpg".length);
    let isJpeg = url.indexOf("jpeg", url.length - "jpeg".length);

    isImage = false;
    if ((isPng !== -1) || (isJpg !== -1) || (isJpeg !== -1)) {
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
        if (height > 1000 || width > 1000) {
            let maxWidth = 800;
            let maxHeight = 500;

            let ratio = Math.min(maxWidth / width, maxHeight / height);
            
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        const rectangles = [
        {
            left: Math.floor(1647/2208 * width),
            top: Math.floor(70/1242 * height),
            width: Math.floor(187/2208 * width),
            height: Math.floor(40/1242 * height),
        },
        {
            left: Math.floor(220/500 * width),
            top: Math.floor(50/280 * height),
            width: Math.floor(170/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width),
            top: Math.floor(75/280 * height),
            width: Math.floor(40/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width),
            top: Math.floor(130/280 * height),
            width: Math.floor(40/500 * width),
            height: Math.floor(25/280 * height),
        },
        {
            left: Math.floor(430/500 * width),
            top: Math.floor(190/280 * height),
            width: Math.floor(40/500 * width),
            height: Math.floor(25/280 * height),
        },
        ];
          
        let newURL = `${attachment.url}?width=${width}&height=${height}`;
        newURL = newURL.replace(`cdn`, `media`);
        newURL = newURL.replace(`com`, `net`);

        console.log(`LOG: Found image with URL ${newURL}`);

        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const values = [];
        isClan = true;
        for (let i = 0; i < rectangles.length; i++) {
            const { data: { text } } = await worker.recognize(newURL, {rectangle: rectangles[i]} );
            if (i==0 && text.indexOf("Trial Run") == -1) {
                isClan = false;
                console.log(`LOG: Image was not detected as clan war image`);
                break;
            } else if (i==0) {
                await message.react('✅');
            }
            values.push(text);
        }

        if (isClan) {
            let intAttack1 = parseInt(values[4].split('\n', 1)[0].trim(), 10);
            let intAttack2 = parseInt(values[3].split('\n', 1)[0].trim(), 10);
            let intAttack3 = parseInt(values[2].split('\n', 1)[0].trim(), 10);
            
            const pad = (num) => { 
                return ('00'+num).slice(-2) 
            };
            
            let date;
            let let3Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let idxDate = -1;
            for (i = 0; i < let3Month.length; i++) {
                if (values[1].indexOf(let3Month[i]) != -1) {
                    idxDate = values[1].indexOf(let3Month[i]);
                    break;
                }
            }

            if (idxDate != -1) {
                date = Date.parse(`${values[1].substr(idxDate, 6)} ${new Date().getUTCFullYear()}`);
                console.log(`LOG: Date Parsed, Found ${date} from ${values[1].substr(idxDate, 6)} ${new Date().getUTCFullYear()}`);
                
                let newdate = new Date(date);
                newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());
                await updateAttackDB(message.author.id, newdate, intAttack1, intAttack2, intAttack3);

                await message.channel.send(new MessageEmbed()
                .setURL("https://twitter.com/priconne_en")
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${message.author.displayName||message.author.username}'s attack`)
                .setDescription(`on ` + 
                    `${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})} ` +
                    `<:nozomiblush:811498063918137375>`)
                .addFields(
                    { name: "Attempt 1 <:critrate:811495998383325244>", value: intAttack1, inline: true },
                    { name: "Attempt 2 <:critrate:811495998383325244>", value: intAttack2, inline: true },
                    { name: "Attempt 3 <:critrate:811495998383325244>", value: intAttack3, inline: true },
                )
                .addField(`Total Damage Dealt For This Day <:critdamage:811495998463148102>`, intAttack1 + intAttack2 + intAttack3)
                .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
                .setTimestamp());
            }
        }
        await worker.terminate();
    });
}

// Bot Commands
const COMMANDS = { help, ping, reset, resetchardb, updategacha, say, profile, clanbattle, rollgacha };

// Chaining Events
client
    .on("ready", () => {
        // Bot Ready
        console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`); 
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.cache.size} SERVERS`);
    })
    .on("guildCreate", guild => {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.cache.size} SERVERS`);
    })
    .on("guildDelete", guild => {
        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
        client.user.setActivity(`RAD DREAM HAS INFECTED ${client.guilds.cache.size} SERVERS`);
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

// Start Stuff
initDB();

// Log In
console.log("Logging In To Princonne Bot");
client.login(process.env["BOT_TOKEN"]);