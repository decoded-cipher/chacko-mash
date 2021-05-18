require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();
var PREFIX = "$"

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', (message) => {
    // console.log(`[${message.author.tag}] : ${message.content}`); 
    if (message.content.startsWith(PREFIX)) {
        var [CMD_NAME, ...args] = message.content.trim().substring(PREFIX.length).split("/\s+/");

        // console.log(CMD_NAME);
        // console.log(args);
        
        if (CMD_NAME === 'wakeup') {
            message.channel.send('Whats Up, Mahn...')
            message.reply('Bye, Let me take a Nap...')
        }
    }
})