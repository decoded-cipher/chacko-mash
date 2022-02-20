require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();
var PREFIX = "$"

client.login(process.env.DISCORDJS_BOT_TOKEN);
client.commands = new Discord.Collection()


// ----- Firebase Config Start -----
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

var database = admin.database()
var memberData = database.ref(process.env.FIREBASE_DATABASE_PATH)
// ----- Firebase Config End -----


var ready = require("./onReady")
client.commands.set(ready.name, ready)

var helpCommand = require("./help-command")
client.commands.set(helpCommand.name, helpCommand)

var birthday = require("./birthday")
client.commands.set(birthday.name, birthday)

var roles = require("./roles")
client.commands.set(roles.name, roles)



client.on('ready', () => {
    client.commands.get('/ready').execute(client)
});


client.on('message', (message) => {
    // console.log(`[${message.author.tag}] : ${message.content}`); 
    if (message.content.startsWith(PREFIX)) {
        var [CMD_NAME, ...args] = message.content.trim().substring(PREFIX.length).split("/\s+/");

        // console.log(CMD_NAME);
        // console.log(args);

        if (CMD_NAME === 'test') {
            message.channel.send('Whats Up, Mahn...')
            message.reply('Bye, Let me take a Nap...')
        }
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
    });

    client.users.cache.get(guildMember.user.id).send(`:tada: Welcome to the **Inovus Labs** Student Community :tada:\n\nHey There,\nPlease make sure that you fill-up this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSeXyH_5QqA8hYPems_uDvljsqjBadrSFuQ1NwdoubkOTV31WA/viewform?usp=pp_url&entry.1728088991=${guildMember.user.id} \n\nPlease don't forget to follow us on Social Medias.\n> Instagram : https://instagram.com/inovuslabs \n> Twitter : https://twitter.com/inovuslabs \n> LinkedIn : https://linkedin.com/company/inovuslabs \n** **`);
})


client.on('message', (message) => {
    if (message.content.startsWith(PREFIX)) {
        var [CMD_NAME, TARGET_CHANNEL, args] = message.content.trim().substring(PREFIX.length).split(" | ");
        TARGET_CHANNEL = TARGET_CHANNEL.replace(/[^0-9]/g,'')
        
        // console.log(CMD_NAME);
        // console.log(TARGET_CHANNEL);
        // console.log(args);

        if (CMD_NAME === 'bot') {
            // console.log((typeof(args)));
            client.channels.cache.get(TARGET_CHANNEL).send(args);
        }

        else if (CMD_NAME === 'bday') {
            // console.log(args);
            memberData.orderByChild("Discord User ID").equalTo(args).on('value', async snapshot => {
                
                var bDayData = await snapshot.val();
                var DiscordUserData = await client.users.fetch(args);
                
                // console.log(bDayData);
                // console.log(DiscordUserData);
                
                client.commands.get('/birthday').execute(client, TARGET_CHANNEL, bDayData, DiscordUserData)
            });
        }

        else {
            message.reply('\nI think you are using the commands in an invalid format.\nTo check-out the command formats, try: **/help**')
        }
    }
})


client.on('message', (message) => {
    if (message.guild === null && !message.author.bot) {
        // console.log(message);
        // console.log(Date());
        // client.channels.cache.get(process.env.TARGET_CHANNEL).send(message.content);

        var newEmbed = new Discord.MessageEmbed()
            .setColor('#4b9fc3')
            // .setAuthor(message.author.username)
            .setAuthor(message.author.username, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
            .setDescription(message.content)
            .setFooter(Date())
        client.channels.cache.get(process.env.TARGET_CHANNEL).send(newEmbed);
    }
})




client.on('message', (message) => {
    if (message.guild && message.content.startsWith('/help')) {

        client.commands.get('/help-command').execute(message, Discord)

    }
});



// client.commands.get('/roles').execute(client)