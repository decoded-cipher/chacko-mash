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

// ---------------------------------------------------------------------------------------------------------------------

var api = require('./apiClient.js')

var onReady = require("./commands/onReady.js");
var helpCommand = require("./commands/helpCommand")
var birthday = require("./commands/birthday")
var bdayNotify = require("./commands/bdayNotify")
var roles = require("./commands/roles")
var welcome = require("./commands/welcome")
var dmUser = require("./commands/dmUser")
var profile = require("./commands/profile")

client.commands.set(onReady.name, onReady)
client.commands.set(helpCommand.name, helpCommand)
client.commands.set(birthday.name, birthday)
client.commands.set(bdayNotify.name, bdayNotify)
client.commands.set(roles.name, roles)
client.commands.set(welcome.name, welcome)
client.commands.set(dmUser.name, dmUser)
client.commands.set(profile.name, profile)

// ---------------------------------------------------------------------------------------------------------------------

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

    } else if (message.guild === null && !message.author.bot) {

        if (message.content.startsWith('/edit-profile')) {
            client.commands.get('/profile').execute(message)

        } else {
            var newEmbed = new Discord.MessageEmbed()
                .setColor('#4b9fc3')
                .setAuthor(message.author.username, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
                .setDescription(message.content)
                .setFooter(IST.toString())
            client.channels.cache.get(process.env.TARGET_CHANNEL).send(newEmbed);
        }
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