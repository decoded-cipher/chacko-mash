module.exports = {
    name : "/helpCommand",
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

        var assignRole = new Discord.MessageEmbed()
            .setColor('#ff702c')
            .setTitle(':crown:   Assign Server Roles')
            .setDescription('**$role | <@role_id> | <@user_01> <@user_02>**\n\nTo assign a role to any no: of users at the same time by **InoBot**.  This command will notify the role assignment in <#883465290556530748> channel & DM respective users about their new role.')
        message.channel.send(assignRole)

        var dmServerMember = new Discord.MessageEmbed()
            .setColor('#2cd5ff')
            .setTitle(':envelope_with_arrow:   DM Server Role(s) or User(s)')
            .setDescription('**$dm | <@role_id> <@user_01> | <Enter the message>\n\n**To send a **Direct Message** to any role(s) or any no: of users at the same time by **InoBot**.  This command will also notify the message delivery in the <#883465290556530748> channel.')
        message.channel.send(dmServerMember)
    }
} 