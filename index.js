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
let { prefix, oneStarRate, twoStarRate, threeStarRate, 
    jewelEmoji, amuletEmoji, manaEmoji, staminaEmoji,
    nozomiCoolEmoji, nozomiBlushEmoji,
    threeStarEmoji, twoStarEmoji, oneStarEmoji,
    starLevelEmoji, swordSmallAttackEmoji, swordBigAttackEmoji, swordEmoji,
    blueSwordEmoji, greenSwordEmoji } = require("./config.json");
const { parse } = require("path");
prefix = prefix || ".";

// Initialize Discord Client
const client = new Client();

// Initialize PG SQL DB Client
let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
dbConfig.ssl = { rejectUnauthorized: false };

// Objects Used To Store Realtime Changes - Obtained Once On Startup
let userData;
let gachaData;
let collectionData;

const cbStart = new Date('Feb 10 2021');
let currentClanBattleId;

// Used at the end to determine if we need to resend query
let isResetGacha = false;

// Footer text
let footerText = `© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`;

// Jewel Emoji
const JEWEL_EMOJI = jewelEmoji.slice(jewelEmoji.lastIndexOf(':')+1, jewelEmoji.length-1);


/* 
    General Helper Functions
*/
const parseFirstArgAsInt = (args, defaultValue) => {
    if (!Array.isArray(args)) return defaultValue;
    if (args.length) {
        let parseAmt = parseInt(args.shift().toLowerCase(), 10);
        if (!isNaN(parseAmt) && parseAmt >= 0) { return parseAmt; }
        else { return defaultValue; }
    } else return defaultValue;
};

const reactionFilter = (author, reaction, user) => 
        [JEWEL_EMOJI].includes(reaction.emoji.id) && user.id === author.id;


/** @param {import("discord.js").Message} message */
const awaitEmoji = async (message, text, emoji, option, cancelText) => {
    /** @type {import("discord.js").Message} */
    let emojiText = await message.channel.send(text);
    emojiText.react(emoji);
    return await emojiText.awaitReactions((reaction, user) => 
                        reactionFilter(message.author, reaction, user), option)
             .catch(() => { message.channel.send(cancelText); });
};



/* 
    Initialize Database Functions
    These Functions Will Initialize The Postgre Database Via Providing SQL Query
*/
const initDB = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        DROP TABLE IF EXISTS ATTACKS;
        DROP TABLE IF EXISTS STATS;
        DROP TABLE IF EXISTS COLLECTION;
        DROP TABLE IF EXISTS CB;

        CREATE TABLE ATTACKS (
            uid varchar NOT NULL,
            attackdate date NOT NULL,
            attempt1damage int DEFAULT 0,
            attempt2damage int DEFAULT 0,
            attempt3damage int DEFAULT 0,
            cbid int NOT NULL
        );

        CREATE TABLE STATS (
            uid varchar NOT NULL,
            level int DEFAULT 1,
            exp int DEFAULT 0,
            lastmessage bigint DEFAULT 0,
            jewels int DEFAULT 0,
            amulets int DEFAULT 0
        );

        CREATE TABLE COLLECTION (
            uid varchar NOT NULL,
            charname varchar NOT NULL,
            starlevel int NOT NULL
        );

        CREATE TABLE CB (
            cbid int DEFAULT 0
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
            charname varchar NOT NULL,
            thumbnailurl varchar NOT NULL,
            fullimageurl varchar NOT NULL,
            starlevel int NOT NULL
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


/*
    Reset Functions 
    These Functions Will Reset Important Databases To Their Original State
*/
/** @param {import("discord.js").Message} message */
const reset = async message => {
    if (message.author.id == 154775062178824192) {
        await initDB();

        // Initialize
        await initAll();

        console.log(`LOG: Users have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset users by ${message.author.username} (${message.author.id})`);
    }
};

/** @param {import("discord.js").Message} message */
const resetgacha = async message => {
    if (message.author.id == 154775062178824192) {
        await initCharDB();

        // Initialize
        await initGacha();
        await updateGacha();

        isResetGacha = true;
        console.log(`LOG: CharDB have been reset by ${message.author.username} (${message.author.id})`);
    } else {
        console.log(`LOG: Failed attempt to reset CharDB by ${message.author.username} (${message.author.id})`);
    }
}



/* 
    Initialize The Objects
    We Retrieve The SQL Data From The DB Once Only. It is Done Here
*/
const initAll = async () => {
    userData = await initUserDataObj();
    collectionData = await initCollectionDataObj();
    cbid = await initCbid();
}

const initGacha = async () => {
    gachaData = await initGachaDataObj();
}

const initUserDataObj = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM STATS`;

    let output = {};
    let userArr;

    try {
        const res = await pgdb.query(query);
        userArr = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let user in userArr) {
        if (userArr.hasOwnProperty(user)) {
            let objectKey = userArr[user].uid;

            const userStats = {
                level : userArr[user].level,
                exp : userArr[user].exp,
                lastmessage : userArr[user].lastmessage,
                jewels : userArr[user].jewels,
                amulets : userArr[user].amulets,
                inroll : false,
                lastclaim : 0
            }

            output[objectKey] = userStats;
        }
    }

    return output
}

const initGachaDataObj = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM CHARDB`;

    let gachaDataObj = {
        1 : {},
        2 : {},
        3 : {}
    };

    let charData;
    try {
        const res = await pgdb.query(query);
        charData = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let char in charData) {
        if (charData.hasOwnProperty(char)) {
            let charInfo = {
                thumbnailurl : charData[char].thumbnailurl,
                fullimageurl : charData[char].fullimageurl
            }

            gachaDataObj[charData[char].starlevel][charData[char].charname] = charInfo;
        }
    }

    return gachaDataObj;
}

const initCollectionDataObj = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM COLLECTION`;

    let collectionData = {};

    let collectedCharData;
    try {
        const res = await pgdb.query(query);
        collectedCharData = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let collect in collectedCharData) {
        if (collectedCharData.hasOwnProperty(collect)) {
            if (!(collectedCharData[collect].uid in collectionData)) {
                collectionData[collectedCharData[collect].uid] = {};
            }
            collectionData[collectedCharData[collect].uid][collectedCharData[collect].charname] = 
                collectedCharData[collect].starlevel
        }
    }

    return collectionData;
}

const initCbid = async () => {
    let currentDate = new Date();
    return (currentDate.getUTCMonth() - cbStart.getUTCMonth()) + ((currentDate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
}



/*
    Retrieving / Updating Attacks Directly From The DB For Easier Calculations 
    Plus, The Attacks isn't going to be accessed often (Once Per Day)
*/
const retrieveDamageDB = async (id, date) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    currentClanBattleId = await initCbid();

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${currentClanBattleId} AND uid = '${id}';

        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE attackdate = '${date}' AND uid = '${id}';

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

const retrieveDamageFromClanId = async (id, clanId) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${clanId} AND uid = '${id}';
    `;

    let damage;
    try {
        const res = await pgdb.query(query);
        console.log(`LOG: Obtained Damage Values For ${id}`);
        
        damage = res.rows[0].total;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return damage;
}

const retrieveAttack = async (id, date) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM ATTACKS WHERE attackdate = '${date}' AND uid = '${id}'`;

    let output = {};
    try {
        const res = await pgdb.query(query);
        console.log(`LOG: Obtained Attacks For ${id}`);
        if (res.rows.length > 0) {
            output = res.rows[0];
        } else {
            output.attempt1damage = 0;
            output.attempt2damage = 0;
            output.attempt3damage = 0;
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return output;
}

const updateAttackDB = async (id, date, attempt1, attempt2, attempt3, cbid) => {    

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



/* 
    Functions Designed To Update The Current Global Objects

*/
const updateGacha = async () => {
    const urls = [];
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85');
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85');
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85%E2%98%85');

    const findTable = '.table > tbody > tr > td > a';
    const findImg = '.ie5 > table > tbody > tr > .style_td img';

    const charArray = [];
    
    for (let i = 0; i < urls.length; i++) {
        charArray.push(await webScrape(urls[i], findTable, findImg));
    }

    for (let i = 0; i < charArray.length; i++) {
        for (let j = 0; j < charArray[i].length; j++) {
            gachaData[i+1][charArray[i][j].name] = { 
                thumbnailurl : charArray[i][j].thumbnailurl, 
                fullimageurl : charArray[i][j].fullimageurl
            };
        }
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
                let thumbnailurl = $('img', rows[i]).attr('src');
                let characterName = imgTitle.substr(idxName + 1);

                let characterInfo = await getGachaData(rows[i].attribs.href, thumbnailurl, findImg, characterName);
                returnArray.push(characterInfo);
            }
        }

        return returnArray;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

const getGachaData = async (href, thumbnailurl, findImg, characterName) => {
    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullimageurl = innerPage(findImg).first().attr('src');

        let characterInfo = {
            name: characterName,
            thumbnailurl: thumbnailurl,
            fullimageurl: fullimageurl
        } 

        return characterInfo;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}

const createUserIfNotExist = async (id) => {
    if (!(id in userData)) {
        let userStats = {
            level : 1,
            exp : 0,
            lastmessage : 0,
            jewels : 0,
            amulets : 0,
            inroll : false,
            lastclaim : 0
        }
        userData[id] = userStats;
    }
}



/*
    Functions Designed To Modify And Edit Basic UserProfile Functions
*/
/** @param {import("discord.js").Message} message */
const addXp = async message => {
    let currentTime = Date.now();
    let id = message.author.id;

    createUserIfNotExist(id);

    if (currentTime - userData[id].lastmessage > 30000) {
        let newXP = Math.floor(Math.random() * 5) + 1;
        userData[id].exp += newXP;

        //console.log(`LOG: ${newXP} XP has been granted to ${message.author.username} (${id}) they have ${userData[id].exp} XP now`);

        userData[id].lastmessage = currentTime;

        let curLevel = 1 + Math.floor(Math.pow(userData[id].exp, 0.8) / 10);

        if (curLevel > userData[id].level) {
            // Level up!
            userData[id].level = curLevel;

            let earnedJewels = curLevel * 10 * (Math.floor(Math.random() * 50) + 1);
            userData[id].jewels += earnedJewels;

            let randomNozomi = [
                'https://static.wikia.nocookie.net/princess-connect/images/4/45/Cute-human-longsword-sakurai_nozomi_rare_gacha001-0-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/1/1c/Nozomi-idolastrum-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/6/63/Nozomi-christmas-sprite-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/89/Cute-human-longsword-sakurai_nozomi_rare_gacha001-1-normal.png',
                'https://static.wikia.nocookie.net/princess-connect/images/8/83/Cute-human-longsword-sakurai_nozomi_normal_start-1-normal.png'
            ]

            let nozomiIdx = Math.floor(Math.random() * 5);

            await message.channel.send(new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setThumbnail(randomNozomi[nozomiIdx])
                .setTitle(`${message.author.displayName||message.author.username}'s Level Up!`)
                .setDescription(`You've leveled up to level **${curLevel}**! \n\n` +
                    `Congrats, you've earned ${earnedJewels} ${jewelEmoji}`)
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp());

            console.log(`LOG: ${message.author.username} (${id}) has leveled up to ${curLevel}`);
        }
    }
};

/** @param {import("discord.js").Message} message */
const profile = async message => {
    
    let profileUser = message.author;
    let avatarUser = profileUser.avatarURL();
    if (message.mentions.members.first()) {
        profileUser =  message.mentions.members.first();
        avatarUser = profileUser.user.avatarURL();
    }

    createUserIfNotExist(profileUser.id);
    let id = profileUser.id;

    const pad = (num) => { 
        return ('00'+num).slice(-2) 
    };
    
    let date = new Date();
    date = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)  + '-' + pad(date.getUTCDate());

    let profileDamage = await retrieveDamageDB(id, date);

    const randomStatus = Math.floor(Math.random() * 5);
    const statusStrings = [
        `A Dapper Fellow ${nozomiCoolEmoji}`,
        `Empty In Mana ${manaEmoji}`,
        `Drowning In Amulets ${amuletEmoji}`,
        `Pulling Literal Garbage ${oneStarEmoji}`,
        `Out Of Shape ${staminaEmoji}`
    ];

    await message.channel.send(new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setThumbnail(avatarUser)
        .setTitle(`${profileUser.displayName||profileUser.username}'s profile`)
        .setDescription(statusStrings[randomStatus])
        .addField(`Level ${starLevelEmoji}`, userData[id].level)
        .addFields(
            { name: `Dealt This Month ${blueSwordEmoji} `, value: profileDamage[0], inline: true },
            { name: `Dealt Today ${greenSwordEmoji} `, value: profileDamage[1], inline: true },
            { name: `Total Dealt ${swordEmoji}`, value: profileDamage[2], inline: true },
            { name: `Jewels ${jewelEmoji} `, value: userData[id].jewels, inline: true },
            { name: `Amulets ${amuletEmoji}`, value: userData[id].amulets, inline: true },
        )
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp());
};

const daily = async message => {
    createUserIfNotExist(message.author.id);

    let bonusGems = (userData[message.author.id].level - 1) * Math.floor((Math.random() * 5) + 1) * 10;
    let dailyGems = 500 + bonusGems;

    let startofDay = new Date();
    startofDay.setUTCHours(0,0,0,0);

    let startofTomorrow = new Date();
    startofTomorrow.setDate(startofTomorrow.getUTCDate() + 1);
    startofTomorrow.setUTCHours(0,0,0,0);

    let currentTime = new Date();

    let timeBefore = Math.floor((startofTomorrow.getTime() - currentTime.getTime()) / 3600000);

    if (startofDay > userData[message.author.id].lastclaim) {
        console.log(`LOG: ${message.author.username} claimed on ${startofDay}`);
        userData[message.author.id].lastclaim = startofDay;
        userData[message.author.id].jewels += dailyGems;

        await message.channel.send(new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`Success! You Have Claimed ${dailyGems} ${jewelEmoji} Today`)
            .setDescription(`(${bonusGems} ${jewelEmoji} bonus for being level ${userData[message.author.id].level})`)
            .addField(`\u200B`, `Come Back In ${timeBefore} Hours To Claim Again`)
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp());
    } else {
        await message.channel.send(new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`Oof out of ${staminaEmoji}`)
            .setDescription(`You Have Already Claimed Today`)
            .addField(`\u200B`, `Come Back In ${timeBefore} Hours To Claim Again`)
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp());
    }
};



/*
    Function To Get The Total Damage From A Certain CB
*/
const getclanbattle = async (message, args) => {
    currentClanBattleId = await initCbid();
    let searchCBid = currentClanBattleId;
    
    if (!Array.isArray(args)) {
        message.channel.send("Error parsing arguments");
        return;
    }

    let cbDate = new Date(cbStart);
    
    if (args.length < 3) {
        searchCBid = parseFirstArgAsInt(args, currentClanBattleId);

        let startDate = new Date(cbStart);
        startDate.setUTCMonth(searchCBid + startDate.getUTCMonth());
        cbDate = new Date(startDate);
    } else if (args.length >= 3) {
        let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
        date = Date.parse(parseDate);
        
        cbDate = new Date(date);
        if (cbDate < cbStart) {
            cbDate = new Date(cbStart);
        } else if (cbDate > new Date()) {
            cbDate = new Date();
        }
        searchCBid = (cbDate.getUTCMonth() - cbStart.getUTCMonth()) + ((cbDate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
    }

    console.log(`LOG: Searching clan battle ${searchCBid}`);

    let parseUser = message.author;
    let avatarUser = message.author.avatarURL();

    if (message.mentions.members.first()) {
        parseUser = message.mentions.members.first();
        avatarUser = message.mentions.members.first().user.avatarURL();
    }

    createUserIfNotExist(parseUser.id);

    console.log(`LOG: Retrieving clan battle #${searchCBid} from ${parseUser.id}`)
    let totalDamage = await retrieveDamageFromClanId(parseUser.id, searchCBid);

    let damageMessage = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setThumbnail(avatarUser)
        .setTitle(`${parseUser.displayName||parseUser.username}'s damage on clan battle #${searchCBid}`)
        .setDescription(`Battle occured on the month of ${cbDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC'})}`)
        .addField(`Total Damage Dealt ${swordBigAttackEmoji}`, totalDamage)
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    await message.channel.send(damageMessage);
}


/*
    Function To Get Previous Clan Battles And Their Times
*/
const clanbattle = async (message, args) => {
    currentClanBattleId = await initCbid();
    
    if (!Array.isArray(args)) {
        message.channel.send("Error parsing arguments");
        return;
    }

    let cbArray = [];
    for (let i = 0; i <= currentClanBattleId; i++) {
        let curDate = new Date(cbStart);
        curDate.setUTCMonth(i + curDate.getUTCMonth());
        let cbDate = curDate;
        cbArray.push(cbDate);
    }
    

    let startPage = await parseFirstArgAsInt(args, 1);
    let displayPerPage = 10;

    let totalPages = Math.ceil(cbArray.length / displayPerPage);
    if (totalPages <= 0) { totalPages = 1; }
    if (startPage < 1 || startPage > totalPages ) {
        startPage = 1;
    }

    console.log(`LOG: Retrieving clan battle information from page ${startPage}`);

    let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setThumbnail("https://static.wikia.nocookie.net/princess-connect/images/5/5b/11-25-20CB.jpg")
        .setTitle(`Clan Battle History`)
        .setDescription(`page ${startPage} / ${totalPages}`)
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    for (let i = (startPage - 1) * displayPerPage; 
        i < cbArray.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
        let clanBattleStr = `Clan Battle #${i}`;
        if (i == currentClanBattleId) { 
            clanBattleStr += ` (Current)`
        }
        messageDisplay.addField(clanBattleStr, 
            `Occured on ${cbArray[i].toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC'})}`);
    }

    await message.channel.send(messageDisplay);
}




/*
    Function To Get A Certain Day's Attacks
*/
const getattacks = async (message, args) => {
    if (!Array.isArray(args)) {
        message.channel.send("Error parsing arguments");
        return;
    }

    if (args.length >= 3) {
        let parseDate = `${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()} ${args.shift().toLowerCase().trim()}`;
        date = Date.parse(parseDate);
        
        const pad = (num) => { 
            return ('00'+num).slice(-2) 
        };

        let newdate = new Date(date);
        let attackClanBattle = (newdate.getUTCMonth() - cbStart.getUTCMonth()) + ((newdate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
        newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());

        console.log(`LOG: Date Parsed From Args, Found ${date}, Converted To ${newdate}`);

        let parseUser = message.author;
        let avatarUser = message.author.avatarURL();

        if (message.mentions.members.first()) {
            parseUser = message.mentions.members.first();
            avatarUser = message.mentions.members.first().user.avatarURL();
        }
    
        createUserIfNotExist(parseUser.id);

        console.log(`LOG: Retrieving attack on ${parseDate} from ${parseUser.id}`)
        let obtainedAttacks = await retrieveAttack(parseUser.id, newdate);

        let damageMessage = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(avatarUser)
            .setTitle(`${parseUser.displayName||parseUser.username}'s attacks`)
            .setDescription(`On ${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}` +
                ` on clan battle #${attackClanBattle}`)
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp();
        
        let totalDamage = obtainedAttacks.attempt1damage + obtainedAttacks.attempt2damage + obtainedAttacks.attempt3damage;
        damageMessage.addField(`Total Damage Dealt ${swordBigAttackEmoji}`, totalDamage);
        damageMessage.addField(`Attempt 1 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt1damage, true);
        damageMessage.addField(`Attempt 2 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt2damage, true);
        damageMessage.addField(`Attempt 3 Dealt ${swordSmallAttackEmoji}`, obtainedAttacks.attempt3damage, true);

        await message.channel.send(damageMessage);
    } 
}




/*
    Functions For Gacha 
*/
/* Loads an image as a canvas Image object from URL */
function loadImage (url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
  
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        img.src = url;
    })
}

/* Combines given images into a single pull */
const createImage = async (message, obtainedImages, amuletsObtained, newUnits, isDupe, rollResults) => {
    let sizThumb = 121;
    let sizOverlay = 40;

    let amuletSRC = await loadImage(
        `https://media.discordapp.net/emojis/811495998450565140.png?width=${sizOverlay}&height=${sizOverlay}`);
    
    var canvas = new Canvas(sizThumb * 5, sizThumb * 2);
    var ctx = canvas.getContext('2d');
    
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < obtainedImages.length; i++) {
        ctx.drawImage(obtainedImages[i], x, y, sizThumb, sizThumb);

        x+= sizThumb;
        if (i == 4) {
            x = 0;
            y += sizThumb;
        }
    }

    x = sizThumb - sizOverlay;
    y = sizThumb - sizOverlay;
    ctx.globalAlpha = 0.8;

    for (let i = 0; i < isDupe.length; i++) {
        if (isDupe[i]) {
            ctx.drawImage(amuletSRC, x, y, sizOverlay, sizOverlay);
        }

        x+= sizThumb;
        if (i == 4) {
            x = sizThumb - sizOverlay;
            y += sizThumb;
        }
    }

    const out = fs.createWriteStream('./test.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  {
            console.log('LOG: The PNG agregate file was created.');

            let amuletStr = `You have earned ${amuletsObtained} ${amuletEmoji}`;

            if (newUnits > 0) {
                amuletStr += ` and have obtained ${newUnits} new characters!`
            }

            let combinedRoll = new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                .setDescription(amuletStr)
                .attachFiles(['./test.png'])
                .setImage('attachment://test.png')
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp();
            
            setTimeout(() => { 
                rollResults.delete();
                message.channel.send(combinedRoll);
                userData[message.author.id].inroll = false
            }, 3000);
    });
}

/* Obtains A Random Character */
const getRolledCharData = async (id, rarity) => {
    const keys = Object.keys(gachaData[rarity]);
    const randomUnit = keys[Math.floor(Math.random() * keys.length)];
    
    const rolledThumb = gachaData[rarity][randomUnit].thumbnailurl;

    let isDupe = 0;
    let amulets = 0;

    if (!(id in collectionData)) {
        collectionData[id] = {};
    }

    if (randomUnit in collectionData[id]) {
        if (rarity == 3) {
            amulets = 50;
        } else if (rarity == 2) {
            amulets = 10;
        } else {
            amulets = 1;
        }
        isDupe = 1;
    } else {
        collectionData[id][randomUnit] = rarity;
    }

    const obtainedImage = await loadImage(rolledThumb);

    let outputData = [obtainedImage, isDupe, amulets]
    return outputData;
}

const rollgacha = async (message) => {
    createUserIfNotExist(message.author.id);
    let id = message.author.id;

    const jewelCost = 1500;

    let pullGacha = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`Rolling x10 On This Gacha Will Cost **${jewelCost}** ${jewelEmoji}`)
        .setDescription(`React To Confirm`)
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    let collected = await awaitEmoji(message, pullGacha,
        JEWEL_EMOJI, { max: 1, time: 20000, errors: ['time'] }, 
        'The Roll Has Been Cancelled.');

    if (!collected) return;
    let reaction = collected.first();

    if (reaction.emoji.id === JEWEL_EMOJI) {
        if (userData[id].jewels >= jewelCost && !userData[id].inroll) {
            // Deduct the jewels immediately
            userData[id].jewels -= jewelCost;
            userData[id].inroll = true;

            const pulledChars = [];
            let rollString = '';

            let embedRoll = new MessageEmbed()
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
                .setDescription(`${rollString}`)
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp();

            let rollResults = await message.channel.send(embedRoll);
            
            let silverCount = 0;
            let amuletsObtained = 0;
            let newUnits = 0;

            let obtainedImages = [];
            let isDupe = [];

            for (let i = 0; i < 10; i++) {
                const rarityRolled = Math.floor(Math.random() * (oneStarRate + twoStarRate + threeStarRate));

                if (rarityRolled < threeStarRate) {
                    rollString += threeStarEmoji;
                    let rollImgData = await getRolledCharData(id, 3);

                    obtainedImages.push(rollImgData[0]);
                    isDupe[i] = rollImgData[1];

                    if (!rollImgData[1]) {
                        newUnits++;
                    }

                    amuletsObtained += rollImgData[2];
                } else if (rarityRolled < (threeStarRate + twoStarRate) || silverCount == 9) {
                    rollString += twoStarEmoji;
                    let rollImgData = await getRolledCharData(id, 2);

                    obtainedImages.push(rollImgData[0]);
                    isDupe[i] = rollImgData[1];

                    if (!rollImgData[1]) {
                        newUnits++;
                    }
                    
                    amuletsObtained += rollImgData[2];
                } else {
                    silverCount++;

                    rollString += oneStarEmoji;
                    let rollImgData = await getRolledCharData(id, 1);

                    obtainedImages.push(rollImgData[0]);
                    isDupe[i] = rollImgData[1];

                    if (!rollImgData[1]) {
                        newUnits++;
                    }
                    
                    amuletsObtained += rollImgData[2];
                }
                embedRoll.setDescription(`${rollString}`);
                rollResults.edit(embedRoll);
                
            }

            userData[id].amulets += amuletsObtained;

            createImage(message, obtainedImages, amuletsObtained, newUnits, isDupe, rollResults);
        } else {
            let reminder;
            if (userData[id].inroll) {
                reminder = await message.channel.send(new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`You are currently doing an x10 roll!`)
                    .setDescription(`Please wait until the roll is finished before trying again`)
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp());
            } else {
                reminder = await message.channel.send(new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`You need at least ${jewelCost} ${jewelEmoji} to roll!`)
                    .setDescription(`You are missing ${jewelCost-userData[id].jewels} ${jewelEmoji}`)
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp());
            }
            setTimeout(() => { reminder.delete();}, 5000);
        }
    }
}


/*
    Other Functions For Gacha
*/
const characters = async (message, args) => {
    if (!(message.author.id in collectionData)) {
        collectionData[message.author.id] = {};
    }

    let displayPerPage = 5;
    let startPage = await parseFirstArgAsInt(args, 1);
    let characters = Object.keys(collectionData[message.author.id]);

    characters.sort(function(x, y) {
        if (collectionData[message.author.id][x] < collectionData[message.author.id][y]) {
          return 1;
        }
        if (collectionData[message.author.id][x] > collectionData[message.author.id][y]) {
          return -1;
        }
        return 0;
      });

    let totalPages = Math.ceil(characters.length / displayPerPage);
    if (totalPages <= 0) { totalPages = 1; }
    if (startPage < 1 || startPage > totalPages ) {
        startPage = 1;
    }
    
    let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setThumbnail(message.author.avatarURL())
        .setTitle(`${message.author.displayName||message.author.username}'s character list`)
        .setDescription(`page ${startPage} / ${totalPages}`)
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    for (let i = (startPage - 1) * displayPerPage; 
        i < characters.length && i < ((startPage - 1) * displayPerPage) + displayPerPage; i++) {
        let starlevel = '★'.repeat(collectionData[message.author.id][characters[i]]);
        let charstr = `\`\`\`${starlevel} ${characters[i]}\`\`\``;

        messageDisplay.addField('\u200b', charstr);
    }

    await message.channel.send(messageDisplay);
}

const character = async (message, args) => {
    if (!(message.author.id in collectionData)) {
        collectionData[message.author.id] = {};
    }

    if (!Array.isArray(args)) {
        await message.channel.send(`Error in parsing arguments`);
    } 
    if (args.length) {
        let character = args.shift().trim();
        
        if (character in collectionData[message.author.id]) {
            let starlevel = collectionData[message.author.id][character];
            let charFullImg = gachaData[starlevel][character].fullimageurl;

            let starstr = '★'.repeat(starlevel);

            let messageDisplay = new MessageEmbed().setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setTitle(`${starstr} ${character}`)
                .setDescription(`Owned By ${message.author.displayName||message.author.username}`)
                .setImage(`${charFullImg}`)
                .setFooter(footerText, client.user.avatarURL())
                .setTimestamp();
            
            await message.channel.send(messageDisplay);
        } else {
            let reminder = await message.reply(`You don't own ${character}`);
            setTimeout(() => { reminder.delete();}, 5000);
        }
    } else {
        let reminder = await message.reply(`Please add a character name after the command`);
        setTimeout(() => { reminder.delete();}, 5000);
    }
}




/*
    Functions For OCR CB Damage Recognitions 
*/
/* Makes sure the attachment is a picture */
const getOcrImage = msgAttach => {
    const url = msgAttach.url;

    const isPng = url.indexOf("png", url.length - "png".length);
    const isJpg = url.indexOf("jpg", url.length - "jpg".length);
    const isJpeg = url.indexOf("jpeg", url.length - "jpeg".length);

    isImage = false;
    if ((isPng !== -1) || (isJpg !== -1) || (isJpeg !== -1)) {
        isImage = true;
    }

    return isImage;
}

/* Returns the OCR result from input message */
/** @param {import("discord.js").Message} message */
const returnOCR = async (message, attempts, maxAttempts) => {
    message.attachments.forEach(async attachment => {
        const worker = createWorker({
            //logger: m => console.log(m), // Add logger here
          });

        let height = attachment.height;
        let width = attachment.width;
        if (height > 1000 || width > 1000) {
            const maxWidth = 800;
            const maxHeight = 500;

            const ratio = Math.min(maxWidth / width, maxHeight / height);
            
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

        for (let i = 0; i < rectangles.length + attempts - maxAttempts; i++) {
            const { data: { text } } = await worker.recognize(newURL, {rectangle: rectangles[i]} );
            if (i==0 && text.indexOf("Trial Run") == -1) {
                isClan = false;
                console.log(`LOG: Image was not detected as clan war image`);
                break;
            } else if (i==0) {
                message.react('✅');
            }
            values.push(text);
        }

        if (isClan) {
            await updateOCRValues(message, values, rectangles);
        }
        await worker.terminate();
    });
}

/* Updates the attack DB based on OCR result and displays a message*/
/** @param {import("discord.js").Message} message */
const updateOCRValues = async (message, values, rectangles) => {
    const intAttacks = [];

    for (let i = 2; i < rectangles.length; i++) {
        if (i < values.length) {
            intAttacks.unshift(parseInt(values[i].split('\n', 1)[0].trim(), 10));
        } else {
            intAttacks.push(0);
        }
    }
    
    const pad = (num) => { 
        return ('00'+num).slice(-2) 
    };
    
    let date;
    const let3Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
        let attackCBid = (newdate.getUTCMonth() - cbStart.getUTCMonth()) + ((newdate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);

        newdate = newdate.getUTCFullYear() + '-' + pad(newdate.getUTCMonth() + 1)  + '-' + pad(newdate.getUTCDate());

        await updateAttackDB(message.author.id, newdate, intAttacks[0], intAttacks[1], intAttacks[2], attackCBid);

        await message.channel.send(new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`${message.author.displayName||message.author.username}'s attack`)
        .setDescription(`On ` + 
            `${new Date(date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})} ` +
            `during clan battle #${attackCBid} ` + `${nozomiBlushEmoji}`)
        .addFields(
            { name: `Attempt 1 ${swordSmallAttackEmoji}`, value: intAttacks[0], inline: true },
            { name: `Attempt 2 ${swordSmallAttackEmoji}`, value: intAttacks[1], inline: true },
            { name: `Attempt 3 ${swordSmallAttackEmoji}`, value: intAttacks[2], inline: true },
        )
        .addField(`Total Damage Dealt For This Day ${swordBigAttackEmoji}`, intAttacks[0] + intAttacks[1] + intAttacks[2])
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp());
    }
}

const scanimage = async (message, args) => {
    const maxAttempts = 3;

    let attempts = parseFirstArgAsInt(args, maxAttempts);
    if (attempts > maxAttempts || attempts < 1) {
        attempts = maxAttempts;
    }

    if (message.attachments.size > 0) {
        if (message.attachments.every(getOcrImage)){
            await returnOCR(message, attempts, maxAttempts);
        }
    }
}


/*
    Fundamental Discord Bot Commands
*/
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

// Commands
const help = message => { 
    message.author.send(
        `*I'll be counting on you, so let's work together until I can become a top idol, okay?\n` + 
        `Ahaha, from now on, I'll be in your care!* \n\n\n` + 
        `**__Nozomi Bot Commands__**\n\n` +                        
        `**${prefix}profile** *[optional @user target]* to obtain your / @user profile information  \n` + 
        `**${prefix}getattacks** *[month] [date] [year] [optional @user target]* to obtain clan battle information on a certain date  \n` + 
        `**${prefix}daily** to obtain your daily gems\n` + 
        `**${prefix}rollgacha** to play on the bot's gacha system\n` + 
        `**${prefix}characters** *[optional page number]* to view the characters you've obtained from gacha \n` + 
        `**${prefix}character** *[mandatory character name(no stars)]* to view full art of a character you've obtained from gacha \n\n\n` + 
        `**__Nozomi Bot Clan Battle Tracker__**\n\n` +
        `**${prefix}scanimage** *[optional single digit 1-3 (default 3)]* as a comment. Make sure to upload a screenshot of the game as an attachment. \n` +
        `This optional parameter will be used to specify how many attempts are visible (Top > Down) on the screenshot\n\n` +
        `Aside from minigames, Nozomi Bot can also serve as a clan battle damage tracker!\n` +
        `To use Nozomi Bot clan track functionality, you must upload an image of the damage attempts for the day to discord.\n` +
        `An example image is provide below, although the image you upload does not necessarily need to be identical, \n` +
        `It is mandatory that the damage text / date of attack are positioned in the correct spots!\n\n` +
        `The easiest way to ensure that these are aligned correctly, is to take a screenshot of the 3 attempts at the top of the list.\n` +
        `Because they're at the top of the list, you will automatically be positioned correctly!\n\n` +
        `Thanks for using Nozomi Bot!`);
    
    let ex1 = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`Image 1 Example`)
        .setDescription(`Example Screenshot For Clan Battle`)
        .attachFiles(['./img/ex1.png'])
        .setImage('attachment://ex1.png')
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    let ex2 = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`Image 2 Example`)
        .setDescription(`Example Screenshot For Clan Battle`)
        .attachFiles(['./img/ex2.png'])
        .setImage('attachment://ex2.png')
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    let ex3 = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`Image 3 Example`)
        .setDescription(`Example Screenshot For Clan Battle`)
        .attachFiles(['./img/ex3.png'])
        .setImage('attachment://ex3.png')
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();

    let ex4 = new MessageEmbed()
        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
        .setAuthor(client.user.username, client.user.avatarURL())
        .setTitle(`Setting Nozomi Bot To Only Search For 2 Attempts`)
        .setDescription(`Example Screenshot For Clan Battle`)
        .attachFiles(['./img/ex4.png'])
        .setImage('attachment://ex4.png')
        .setFooter(footerText, client.user.avatarURL())
        .setTimestamp();
    
    message.author.send(ex1);
    message.author.send(ex2);
    message.author.send(ex3);
    message.author.send(ex4);
}



/* Update Methods Designed To Update The Postgre SQL DB After The App Stops  */
const updateAll = async () => {
    for(let id in collectionData) {
        if (collectionData.hasOwnProperty(id)) {
            for(let charname in collectionData[id]) {
                if (collectionData[id].hasOwnProperty(charname)) {
                    let starlevel = collectionData[id][charname];
                    await updateCollection(id, charname, starlevel);
                }
            }
        }
    }

    if (isResetGacha) {
        for (let starlevel in gachaData) {
            if (gachaData.hasOwnProperty(starlevel)) {
                for(let charname in gachaData[starlevel]) {
                    if (gachaData[starlevel].hasOwnProperty(charname)) {
                        await updateCharDB(charname, gachaData[starlevel][charname].thumbnailurl, gachaData[starlevel][charname].fullimageurl, starlevel);
                    }
                }
            } 
        }
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

const updateStatsDB = async (id, level, exp, lastmessage, jewels, amulets) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE STATS SET level = ${level}, exp = ${exp}, lastmessage = ${lastmessage}, jewels = ${jewels}, amulets = ${amulets}
            WHERE uid = '${id}';
        INSERT INTO STATS (uid, level, exp, lastmessage, jewels, amulets)
            SELECT '${id}', ${level}, ${exp}, ${lastmessage}, ${jewels}, ${amulets}
            WHERE NOT EXISTS (SELECT 1 FROM STATS WHERE uid = '${id}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: STATS table is successfully updated with values: '${id}', ${level}, ${exp}, ${jewels}, ${amulets}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateCharDB = async (charname, thumbnailurl, fullimageurl, starlevel) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    console.log(`LOG: Adding ${charname} To The Database`);

    const query = `
        UPDATE CHARDB SET thumbnailurl = '${thumbnailurl}', fullimageurl = '${fullimageurl}', starlevel = ${starlevel}
            WHERE charname = '${charname}';
        INSERT INTO CHARDB (charname, thumbnailurl, fullimageurl, starlevel)
            SELECT '${charname}', '${thumbnailurl}', '${fullimageurl}', ${starlevel}
            WHERE NOT EXISTS (SELECT 1 FROM CHARDB WHERE charname = '${charname}');
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}

const updateCollection = async (id, charname, starlevel) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        INSERT INTO COLLECTION (uid, charname, starlevel)
            SELECT '${id}', '${charname}', ${starlevel}
            WHERE NOT EXISTS (SELECT 1 FROM COLLECTION WHERE uid = '${id}' AND charname = '${charname}');
    `;

    try {
        const res = await pgdb.query(query);
        //console.log(`LOG: ${charname} was successfully added to ${id}'s collection`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}



// Bot Commands
const COMMANDS = { help, ping, reset, resetgacha, say, profile, daily, 
    getclanbattle, clanbattle, rollgacha, characters, character, getattacks, scanimage };

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

        // Prefix Matches
        if(message.content.indexOf(prefix) !== 0) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        COMMANDS[command] && COMMANDS[command](message, args);
    });

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("SIGINT", async () => (await updateAll(), process.exit(0)));
process.on("SIGTERM", async () => (await updateAll(), process.exit(0)));

// Start Stuff
//initDB();
// OK

// Initialize
initAll();
initGacha();

// Log In
console.log("Logging In To Princonne Bot");
client.login(process.env["BOT_TOKEN"]);
