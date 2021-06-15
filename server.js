require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();
var PREFIX = "$"

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    client.channels.cache.get(process.env.GENERAL_CHANNEL).send('👋')
    client.channels.cache.get(process.env.GENERAL_CHANNEL).send(`Hey it\'s me ${client.user.username}.\nI\'m back online.\nSorry for the little nap! 😊`)
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


client.on('guildMemberAdd', guildMember => {

    var welcomeImages = [
        "http://www.whykol.com/wp-content/uploads/2015/04/godfather-051.jpg",
        "http://www.whykol.com/wp-content/uploads/2015/04/godfather-050.jpg",
        "https://commentphotos.com/images/opengraph/CommentPhotos.com_1392031418.jpg",
        "http://www.whykol.com/wp-content/uploads/2014/11/punjabi-house-163.jpg",
        "http://www.whykol.com/wp-content/uploads/2014/12/kilukkam-135.jpg",
        "https://i.ytimg.com/vi/7IHACqXvlyA/hqdefault.jpg",
        "http://www.whykol.com/wp-content/uploads/2015/06/rajamanikyam-001.jpg",
        "https://user-images.githubusercontent.com/44474792/122104658-87b05180-ce35-11eb-8671-db90c37baead.jpg"
    ]
    var randomIndex = Math.floor(Math.random() * welcomeImages.length);

    guildMember.guild.channels.cache.get(process.env.GENERAL_CHANNEL).send(`Welcome <@${guildMember.user.id}> to Inovus Labs IEDC Discord Server!\n`, {
        files: [`${welcomeImages[randomIndex]}`]
    })
})