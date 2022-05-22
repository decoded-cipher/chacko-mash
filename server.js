require('dotenv').config()

var moment = require('moment-timezone');
moment().tz("Asia/Colombo").format();

var utc = new Date();
var IST = moment.utc(utc).tz("Asia/Colombo");

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
var birthdayData = database.ref(process.env.FIREBASE_BDAY_PATH)
// ----- Firebase Config End -----

var api = require('./apiClient.js')

var onReady = require("./onReady")
client.commands.set(onReady.name, onReady)

var helpCommand = require("./helpCommand")
client.commands.set(helpCommand.name, helpCommand)

var birthday = require("./birthday")
client.commands.set(birthday.name, birthday)

var bdayNotify = require("./bdayNotify")
client.commands.set(bdayNotify.name, bdayNotify)

var roles = require("./roles")
client.commands.set(roles.name, roles)

var welcome = require("./welcome")
client.commands.set(welcome.name, welcome)

var dmUser = require("./dmUser")
client.commands.set(dmUser.name, dmUser)



client.once('ready', async () => {
    await client.commands.get('/onReady').execute(client)

    var mm = moment(IST).format("M");
    var dd = moment(IST).format("D");

    api.getBdayUser(dd, mm).then((users) => {
        if (users != 'No data found') {
            client.commands.get('/bdayNotify').execute(client, users, Discord)
        }
    }).catch((error) => {
        console.log(error);
    })

});

client.on('guildMemberAdd', guildMember => {
    client.commands.get('/welcome').execute(client, guildMember)
})

client.on('message', (message) => {
    if (message.guild && message.content.startsWith('/help')) {
        client.commands.get('/helpCommand').execute(message, Discord)
    }
});



client.on('message', async (message) => {
    if (message.content.startsWith(PREFIX)) {

        if (message.member.roles.cache.find(role => role.id === process.env.PRIORITY_ROLE_01 || role.id === process.env.PRIORITY_ROLE_02)) {

            var [CMD_NAME, TARGET_CHANNEL, args] = message.content.trim().substring(PREFIX.length).split(" | ");
            TARGET_CHANNEL = TARGET_CHANNEL.replace(/[^0-9\s]/g, '')

            if (CMD_NAME === 'bot') {

                client.channels.cache.get(TARGET_CHANNEL).send(args);

            } else if (CMD_NAME === 'bday') {
                
                api.getExtUserData(args).then((userData) => {
                    client.commands.get('/birthday').execute(client, TARGET_CHANNEL, userData, IST)
                }).catch((error) => {
                    console.log(error);
                })

            } else if (CMD_NAME === 'role') {

                client.commands.get('/roles').execute(client, message, TARGET_CHANNEL, args)
                
            } else if (CMD_NAME === 'dm') {

                client.commands.get('/dmUser').execute(client, message, TARGET_CHANNEL, args)
                
            } else {
                message.reply('\nI think you are using the commands in an invalid format.\nTo check-out the command formats, try: **/help**')
            }

        } else {
            message.reply(`\nYou are not allowed to use this command.\nPlease contact <@&${process.env.PRIORITY_ROLE_01}> for more details.`)
        }
    }
})



client.on('message', (message) => {
    if (message.guild === null && !message.author.bot) {

        var newEmbed = new Discord.MessageEmbed()
            .setColor('#4b9fc3')
            // .setAuthor(message.author.username)
            .setAuthor(message.author.username, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
            .setDescription(message.content)
            .setFooter(IST.toString())
        client.channels.cache.get(process.env.TARGET_CHANNEL).send(newEmbed);
    }
})