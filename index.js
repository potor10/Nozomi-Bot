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

// Objects Used To Store Realtime Changes - Obtained Once On Startup
let userData;
let gachaData;
let collectionData;
let currentClanBattleId;



/* 
    General Helper Functions
*/
const parseFirstArgAsInt = (args, defaultValue) => {
    if (!Array.isArray(args)) return defaultValue;
    if (args.length) {
        let parseAmt = parseInt(args.shift().toLowerCase(), 10);
        if (!isNaN(parseAmt) && parseAmt > 0) return parseAmt;
    } else return defaultValue;
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
            charname varchar NOT NULL
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
        initDB();

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
        gachaData = await initGachaDataObj();
        console.log(gachaData);

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
    currentClanBattleId = await initCbid();

    console.log(userData);
    console.log(collectionData);
    console.log(currentClanBattleId);
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

    for (let row in userArr) {
        let objectKey = row.uid;

        let userStats = {
            level : row.level,
            exp : row.exp,
            lastmessage : row.lastmessage,
            jewels : row.jewels,
            amulets : row.amulets
        }

        output[objectKey] = userStats;
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

    for (let row in charData) {
        let charNameKey = row.charname;

        let charInfo = {
            thumbnailurl : row.thumbnailurl,
            fullimageurl : row.fullimageurl
        }

        gachaDataObj[row.starlevel][charNameKey] = charInfo;
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

    for (let row in collectedCharData) {
        let objectKey = row.uid;

        collectionData[objectKey][row.charname] = 1;
    }

    return collectionData;
}

const initCbid = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT cbid FROM CB`;

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



/*
    Retrieving / Updating Attacks Directly From The DB For Easier Calculations 
    Plus, The Attacks isn't going to be accessed often (Once Per Day)
*/
const retrieveDamageDB = async (id, date) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${currentClanBattleId} AND uid = '${id}';

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

const updateAttackDB = async (id, date, attempt1, attempt2, attempt3) => {    

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE ATTACKS SET attempt1damage = ${attempt1}, attempt2damage = ${attempt2}, attempt3damage = ${attempt3}, cbid = ${currentClanBattleId}
            WHERE uid = '${id}' AND attackDate = '${date}';
        INSERT INTO ATTACKS (uid, attackDate, attempt1damage, attempt2damage, attempt3damage, cbid)
            SELECT '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, ${currentClanBattleId}
            WHERE NOT EXISTS (SELECT 1 FROM ATTACKS WHERE uid = '${id}' AND attackDate = '${date}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ATTACKS table is successfully updated with values: '${id}', '${date}', ${attempt1}, ${attempt2}, ${attempt3}, ${currentClanBattleId}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}



/* 
    Functions Designed To Update The Current Global Objects

*/
const updategacha = async (message) => {
    if (message.author.id == 154775062178824192) {
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

        console.log(charArray);

        for (let i = 0; i < charArray.length; i++) {
            for (let j = 0; j < charArray[i].length; j++) {
                gachaData[i+1][charArray[i][j].name] = { 
                    thumbnailurl : charArray[i][j].thumbnailurl, 
                    fullimageurl : charArray[i][j].fullimageurl
                };
            }
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
            amulets : 0
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

    if (currentTime - userData[id].lastmessage > 3000) { //missing 00
        let newXP = userData[id].exp + Math.floor(Math.random() * 5) + 1;
        console.log(`LOG: ${newXP - userData[id].exp} XP has been granted to ${message.author.username} (${id})`);

        userData[id].lastmessage =currentTime;

        let curJewel = userData[id].jewels;
        let curLevel = 1 + Math.floor(Math.sqrt(newXP));

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
                .setURL("https://twitter.com/priconne_en")
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setAuthor(client.user.username, client.user.avatarURL())
                .setThumbnail(randomNozomi[nozomiIdx])
                .setTitle(`${message.author.displayName||message.author.username}'s Level Up!`)
                .setDescription(`You've leveled up to level **${curLevel}**! \n\n` +
                    `Congrats, you've earned ${earnedJewels} <:jewel:811495998194450454>`)
                .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
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
        "A Dapper Fellow <:coolnozomi:811498063527936031>",
        "Empty In Mana <:mana:811498063515353149>",
        "Drowning In Amulets <:tears:811495998450565140>",
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
        .addField("Level <:starico:811495998479532032>", userData[id].level)
        .addFields(
            { name: "Dealt This War <:bluesword:811495998479925268>", value: profileDamage[0], inline: true },
            { name: "Dealt Today <:greensword:811495998374805514> ", value: profileDamage[1], inline: true },
            { name: "Total Dealt <:patk:811495998156439563>", value: profileDamage[2], inline: true },
            { name: "Jewels <:jewel:811495998194450454> ", value: userData[id].jewels, inline: true },
            { name: "Amulets <:tears:811495998450565140>", value: userData[id].amulets, inline: true },
        )
        .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
        .setTimestamp());
};



/*
    Function To Edit Clanbattle Value
*/
const clanbattle = async (message, args) => {
    let newClanBattleId = parseFirstArgAsInt(args, currentClanBattleId);
    if (currentClanBattleId != newClanBattleId) {
        if (message.author.id == 154775062178824192) {
            currentClanBattleId = newClanBattleId
            await message.channel.send(`Current Clan Battle Identification Number Set To: ${newClanBattleId}`);
        } else {
            message.channel.send(`You do not have the permission to use this`);
        }
    } else {
        await message.channel.send(`Current Clan Battle Identification Number Is: ${currentClanBattleId}`);
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
const createImage = async (message, obtainedImages, amuletsObtained, newUnits) => {
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

            let amuletStr = `You have earned ${amuletsObtained} <:tears:811495998450565140>`;

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
                .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
                .setTimestamp();
            
            rollResults.delete();
            message.channel.send(combinedRoll);
    });
}

/* Obtains A Random Character */
const getRolledCharData = async (id, rarity) => {
    const randomKey = (gacha) => {
        let keys = Object.keys(gacha);
        return gacha[keys[ keys.length * Math.random() << 0]];
    };
    const randomUnit = randomKey(gachaData[rarity-1]);
    
    const rolledName = gachaData[rarity-1][randomUnit].charname;
    const rolledThumb = gachaData[rarity-1][randomUnit].thumbnailurl;
    let isDupe = 0;
    let amulets = 0;

    console.log(randomUnit);
    console.log(gachaData[rarity-1].charname);
    if (rolledName in collectionData[id]) {
        if (rarity == 3) {
            amulets = 50;
        } else if (rarity == 2) {
            amulets = 10;
        } else {
            amulets = 1;
        }
        isDupe = 1;
    } else {
        collectionData[id].rolledName = 1;
    }

    const obtainedImage = await loadImage(rolledThumb);

    let outputData = [obtainedImage, isDupe, amulets]
    return outputData;
}

const rollgacha = async (message) => {
    createUserIfNotExist(message.author.id);
    let id = message.author.id;

    const jewelCost = 0;

    if (userData[id].jewels >= jewelCost) {
        // Deduct the jewels immediately
        userData[id].jewels -= jewelCost;

        const pulledChars = [];
        let rollString = '';

        let embedRoll = new MessageEmbed()
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setTitle(`${message.author.displayName||message.author.username}'s x10 Gacha Roll`)
            .setDescription(`${rollString}`)
            .setFooter(`© Potor10's Autistic Industries ${new Date().getUTCFullYear()}`, client.user.avatarURL())
            .setTimestamp();

        let rollResults = await message.channel.send(embedRoll);
        
        let silverCount = 0;
        let amuletsObtained = 0;
        let newUnits = 0;

        let obtainedImages = [];
        let isDupe = [];

        for (let i = 0; i < 10; i++) {
            console.log(`ran ${i} times`);  

            const rarityRolled = Math.floor(Math.random() * (oneStarRate + twoStarRate + threeStarRate));

            if (rarityRolled < threeStarRate) {
                rollString += '<:poggerona:811498063578529792>';
                let rollImgData = await getRolledCharData(id, 3);

                obtainedImages.push(rollImgData[0]);
                isDupe[i] = rollImgData[1];

                if (!rollImgData[1]) {
                    newUnits++;
                }

                amuletsObtained += rollImgData[2];
            } else if (rarityRolled < (threeStarRate + twoStarRate) || silverCount == 9) {
                rollString += '<:bitconnect:811498063641837578>';
                let rollImgData = await getRolledCharData(id, 2);

                obtainedImages.push(rollImgData[0]);
                isDupe[i] = rollImgData[1];

                if (!rollImgData[1]) {
                    newUnits++;
                }
                
                amuletsObtained += rollImgData[2];
            } else {
                silverCount++;

                rollString += '<:garbage:811498063427928086>';
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

        createImage(message, obtainedImages, amuletsObtained, newUnits);
    } else {
        let reminder = await message.reply(`You Need At Least 1500 <:jewel:811495998194450454> To Roll! \n` +
            `You Are Missing ${jewelCost-profile.jewels} <:jewel:811495998194450454> `);
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
const returnOCR = async message => {
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
            await updateOCRValues(message, values);
        }
        await worker.terminate();
    });
}

/* Updates the attack DB based on OCR result and displays a message*/
/** @param {import("discord.js").Message} message */
const updateOCRValues = async (message, values) => {
    const intAttack1 = parseInt(values[4].split('\n', 1)[0].trim(), 10);
    const intAttack2 = parseInt(values[3].split('\n', 1)[0].trim(), 10);
    const intAttack3 = parseInt(values[2].split('\n', 1)[0].trim(), 10);
    
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
const help = message => message.author.send(`I'll be counting on you, so let's work together until I can become a top idol, okay? Ahaha, from now on, I'll be in your care! \n\n` + 
                                            `TYPE **.ebola** TO BECOME DOWN SYNDROMED \n` + 
                                            `TYPE **.daily** TO OBTAIN YOUR DAILY REWARDS AND SETUP YOUR PROFILE \n` + 
                                            `TYPE **.spin** TO SPIN THE WHEEL OF BITCONNECT\n` + 
                                            `TYPE **.profile** [@user] TO LOOK AT PROFILES \n` + 
                                            `TYPE **.price <size>** TO LOOK AT BITCONNECT PRICES \n` + 
                                            `TYPE **.buy/.sell <amt> <size>** TO PURCHASE OR SELL BITCONNECT`);



/* Update Methods Designed To Update The Postgre SQL DB After The App Stops  */
const updateAll = async () => {
    await updateCBID(currentClanBattleId);
    for(let id in userData) {
        if (userData.hasOwnProperty(id)) {
            await updateStatsDB(id, userData[id].level, userData[id].exp, userData[id].lastmessage, userData[id].jewels, userData[id].amulets);
        }
    } 
    for (let starlevel in gachaData) {
        if (gachaData.hasOwnProperty(starlevel)) {
            for(let charname in gachaData[starlevel]) {
                if (gachaData[starlevel].hasOwnProperty(charname)) {
                    await updateCharDB(charname, gachaData[starlevel][charname].thumbnailurl, gachaData[starlevel][charname].fullimageurl, starlevel);
                }
            }
        } 
    }
    for(let id in collectionData) {
        if (collectionData.hasOwnProperty(id)) {
            for(let charname in collectionData[id]) {
                if (collectionData[id].hasOwnProperty(charname)) {
                    await updateCollection(id, charname);
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
        INSERT INTO STATS (uid, level, exp, lastMessage, jewels, amulets)
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

    console.log(charName);

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

const updateCollection = async (id, charname) => {    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    console.log(charName);

    const query = `
        INSERT INTO COLLECTION (uid, charname)
            SELECT '${id}', '${charname}'
            WHERE NOT EXISTS (SELECT 1 FROM COLLECTION WHERE uid = '${id}' AND charname = '${charname}');
    `;

    console.log(query);

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ${charname} was successfully added to ${id}'s collection`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}



// Bot Commands
const COMMANDS = { help, ping, reset, resetgacha, updategacha, say, profile, clanbattle, rollgacha };

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
process.on("SIGINT", async () => (await updateAll(), process.exit(0)));
process.on("SIGTERM", async () => (await updateAll(), process.exit(0)));

// Start Stuff
//initDB();

// Initialize
initAll();
initGacha();

// Log In
console.log("Logging In To Princonne Bot");
client.login(process.env["BOT_TOKEN"]);







/* Method GRAVEYARD, FOR THE STUFF THAT ISN'T GONNA BE USED */

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