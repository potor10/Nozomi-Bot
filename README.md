# Nozomi Bot
![Alt](https://media.discordapp.net/attachments/802247690729160704/811168254525046784/My_Post_1.png)

### Nozomi Bot can be added to your discord server via this [link](https://discord.com/api/oauth2/authorize?client_id=811178273848557610&permissions=519232&scope=bot). 

## About Nozomi Bot

Nozomi is a character from the mobile game Princess Connect : Redive. 
Princess Connect : Redive is developed by the company Cygames and has its own Anime adaptation. 

This bot aims to a assist Princess Connect : Redive players with tracking clan battle information. 
It is written in JavaScript using Node.js and is synced to a Postgre SQL database hosted on Heroku.

## Features
Nozomi Bot has:
* Clan battle image parser
    * Store + track clan battle damage over the current month
    * Easy upload & go method instead of manually requesting user input
    * Calculates total damage across the month
    * Shows each individual attack across the month
* Fully featured leveling / profile system
    * Gain jewels for daily activity
    * Level up your account profile for typing in chat 
        * Lvl up message appears in #bot-spam channel by default. 
        * If #bot-spam doesn't exist, it will appear in the current channel
* Gacha and collection
    * Spend gems to roll on the gacha to pull characters
    * New characters will be added to your collection
    * Duplicate characters will be converted into amulets
    * This gacha does not account for seasonal units and will group all units on a certain rarity together.
        * This means you can pull every possible unit in Priconne R
* Music Bot
    
## Dependencies
* Discord.js 
    * Necessary to interact with discord
* tesseract.js 
    * OCR image recognition for the uploaded clan battle screenshot
* pg
    * Postgre SQL client
* parse-database-url
    * Parse input URL param for Postgre SQL DB login info
* cheerio
    * Webscraper for gacha data
* got
    * Send request for website
* canvas
    * Join images together to create final gacha pull
* discord-player
    * Discord music bot functionality
    
## Final
Thank you for using Nozomi Bot. 
Potor10


