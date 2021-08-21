require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();
var PREFIX = "$"

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    client.channels.cache.get(process.env.LOBBY_CHANNEL).send('👋')
    client.channels.cache.get(process.env.LOBBY_CHANNEL).send(`Hey fellas, I\'m back online.\nSorry for the little nap!\n😊`, {
        files: ['https://user-images.githubusercontent.com/44474792/126882345-a229f1c8-0ad6-455e-b2e4-eba1b580cb2e.jpg']
    })
});


client.on('message', (message) => {
    // console.log(`[${message.author.tag}] : ${message.content}`); 
    if (message.content.startsWith('/test')) {
        var [CMD_NAME, ...args] = message.content.trim().substring('/test'.length).split("/\s+/");

        // console.log(CMD_NAME);
        // console.log(args);

        message.channel.send('Whats Up, Mahn...')
        message.reply('Bye, Let me take a Nap...')

    }
})


client.on('guildMemberAdd', guildMember => {

    var welcomeImages = [
        "https://user-images.githubusercontent.com/44474792/126882769-2c86e588-8172-4c76-b41c-d8a0db5bdb56.png",
        "https://user-images.githubusercontent.com/44474792/126882807-2f2646a8-c984-472f-b0b5-f7a063958b6a.jpg",
        "https://user-images.githubusercontent.com/44474792/126882789-e8482f11-cb5b-4e8f-86ea-4ec5184c2db6.jpg",
        "https://user-images.githubusercontent.com/44474792/126882790-76c2109a-df80-4971-8741-ae3b42c78b23.jpg",
        "https://user-images.githubusercontent.com/44474792/126882794-1526d5e0-5acd-4abb-aad4-e25704562348.jpg",
        "https://user-images.githubusercontent.com/44474792/126882802-8a014326-59dd-45ca-9c56-92aea2961428.jpg",
        "https://user-images.githubusercontent.com/44474792/122104658-87b05180-ce35-11eb-8671-db90c37baead.jpg"
    ]
    var randomIndex = Math.floor(Math.random() * welcomeImages.length);

    guildMember.guild.channels.cache.get(process.env.LOBBY_CHANNEL).send(`Welcome <@${guildMember.user.id}> to Inovus Labs IEDC Discord Server!\n`, {
        files: [`${welcomeImages[randomIndex]}`]
    })
})


client.on('message', (message) => {
    if (message.content.startsWith(PREFIX)) {
        var [CMD_NAME, TARGET_CHANNEL, args] = message.content.trim().substring(PREFIX.length).split(" | ");
        TARGET_CHANNEL = TARGET_CHANNEL.replace(/[^0-9]/g, '')

        // console.log(CMD_NAME);
        // console.log(TARGET_CHANNEL);
        // console.log(args);

        if (CMD_NAME === 'bot') {
            // console.log((typeof(args)));
            client.channels.cache.get(TARGET_CHANNEL).send(args);
        }
    }
})


client.on('message', (message) => {
    if (message.guild && message.content.startsWith('/private')) {
        
        var text = message.content.slice('/private'.length);
        message.guild.members.cache.forEach(member => {
            // if (member.id != client.user.id && !member.user.bot) member.send(text)

            if (member.id != client.user.id && !member.user.bot) member.send(text, {
                files: ['https://user-images.githubusercontent.com/44474792/130306445-3b1a60f6-8d12-418e-91e9-88b9d85f9e6f.jpg']
            })
        });
    }
});