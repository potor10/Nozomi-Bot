module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'Core',
    utilisation: '{prefix}help',

    execute(client, message, args) {
        message.author.send(
            `*I'll be counting on you, so let's work together until I can become a top idol, okay?\n` + 
            `Ahaha, from now on, I'll be in your care!* \n\n\n` + 
            `**__Nozomi Bot Commands__**\n\n` +                        
            `**${prefix}profile** *[optional @user target]* to obtain your / @user profile information  \n` + 
            `**${prefix}getattacks** *[month] [date] [year] [optional @user target]* to obtain attack information on a specific date  \n` + 
            `**${prefix}getclanbattle** *[Clan Battle number] [optional @user target]* to obtain Clan Battle information on a specific month  \n` +
            `**${prefix}getclanbattle** *[month] [date] [year] [optional @user target]* to obtain Clan Battle information on a specific month  \n` + 
            `**${prefix}clanbattlehistory** *[optional page number]* to obtain a directory of all previous Clan Battles and when they occured \n` + 
            `**${prefix}daily** to obtain your daily gems\n` + 
            `**${prefix}rollgacha** to play on the bot's gacha system\n` + 
            `**${prefix}characters** *[optional page number]* to view the characters you've obtained from gacha \n` + 
            `**${prefix}character** *[mandatory character name(no stars)]* to view full art of a character you've obtained from gacha \n\n\n` + 
            `**__Nozomi Bot Clan Battle Tracker__**\n\n` +
            `**${prefix}scanimage** *[optional single digit 1-3 (default 3)]* as a comment. Make sure to upload a screenshot of the game as an attachment. \n` +
            `This optional parameter will be used to specify how many attempts are visible (Top > Down) on the screenshot\n\n` +
            `Aside from minigames, Nozomi Bot can also serve as a Clan Battle damage tracker!\n` +
            `To use Nozomi Bot clan track functionality, you must upload an image of the damage attempts for the day to discord.\n` +
            `An example image is provide below, although the image you upload does not necessarily need to be identical, \n` +
            `It is mandatory that the damage text / date of attack are positioned in the correct spots!\n\n` +
            `The easiest way to ensure that these are aligned correctly, is to take a screenshot of the 3 attempts at the top of the list.\n` +
            `Because they're at the top of the list, you will automatically be positioned correctly!\n\n` +
            `Thanks for using Nozomi Bot!`)
            .catch(() => message.reply("Your DM is disabled, I can't send help"));;
        
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
            .setDescription(`How To Upload Screenshot`)
            .attachFiles(['./img/ex4.png'])
            .setImage('attachment://ex4.png')
            .setFooter(footerText, client.user.avatarURL())
            .setTimestamp();
        
        message.author.send(ex1);
        message.author.send(ex2);
        message.author.send(ex3);
        message.author.send(ex4);
    },
};