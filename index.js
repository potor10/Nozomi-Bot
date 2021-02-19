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

const { parse } = require("path");

// Initialize Discord Client
const client = new Client({disableMentions: 'everyone'});

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

let given = {
    brown : "kmsIdie"
};
console.log(`start test ${given}`);
let run = require('./test');
run(given);
console.log(given);

client.player = new Player(client);
client.config = require('./config/config');
client.emotes = client.config.emojis;
client.filters = client.config.filters;
client.commands = new discord.Collection();

// Emoji IDs
const JEWEL_EMOJI = client.emotes.jewelEmoji.slice(client.emotes.jewelEmoji.lastIndexOf(':')+1, client.emotes.jewelEmoji.length-1);
const NOZOMI_BLUSH_EMOJI = client.emotes.nozomiBlushEmoji.slice(client.emotes.nozomiBlushEmoji.lastIndexOf(':')+1, client.emotes.nozomiBlushEmoji.length-1);


fs.readdirSync('./commands').forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));

    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`LOG: Loading command ${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    };
});

const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));

for (const file of events) {
    console.log(`LOG: Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};

for (const file of player) {
    console.log(`LOG: Loading discord-player event ${file}`);
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("SIGINT", async () => (await updateAll(), process.exit(0)));
process.on("SIGTERM", async () => (await updateAll(), process.exit(0)));

//Initialize
initAll();
initGacha();

// Log In
console.log("LOG: Logging In To Princonne Bot");
client.login(process.env["BOT_TOKEN"]);
