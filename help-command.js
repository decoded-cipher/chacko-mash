module.exports = {
    name : "/help-command",
    // description : "",
    execute(message, Discord) {

        var customMessage = new Discord.MessageEmbed()
            .setColor('#f7ff2c')
            .setTitle(':newspaper:   Custom Message in a Channel')
            .setDescription('**$bot | <#channel_id> | <Enter the message>**\n\nTo post notifications or announcements by **InoBot** in any specified channel. This command can only be executed from a channel where **InoBot** has enough permissions.')
        message.channel.send(customMessage)

        var bdayWish = new Discord.MessageEmbed()
            .setColor('#ff2cda')
            .setTitle(':birthday:   Generate Birthday Wish')
            .setDescription('**$bday | <#channel_id> | <user_id>**\n\nTo post a birthday wish by **InoBot** in any specified channel. This will also generate a custom unique **Birthday Wish Card**.')

        message.channel.send(bdayWish)
    }
} 