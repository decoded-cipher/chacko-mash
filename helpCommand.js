module.exports = {
    name: "/helpCommand",
    // description : "",
    execute(message, Discord) {

        var data = [
            {
                name: "customMessage",
                color: "#f7ff2c",
                title: ":newspaper:   Custom Message in a Channel",
                description: "**$bot | <#channel_id> | <Enter the message>**\n\nTo post notifications or announcements by **InoBot** in any specified channel. This command can only be executed from a channel where **InoBot** has enough permissions."
            }, {
                name: "bdayWish",
                color: "#ff2cda",
                title: ":birthday:   Generate Birthday Wish",
                description: "**$bday | <#channel_id> | <user_id>**\n\nTo post a birthday wish by **InoBot** in any specified channel. This will also generate a custom unique **Birthday Wish Card**."
            }, {
                name: "assignRole",
                color: "#ff702c",
                title: ":crown:   Assign Server Roles",
                description: "**$role | <@role_id> | <@user_01> <@user_02>**\n\nTo assign a role to any no: of users at the same time by **InoBot**.  This command will notify the role assignment in <#883465290556530748> channel & DM respective users about their new role."
            }, {
                name: "dmServerMember",
                color: "#2cd5ff",
                title: ":envelope_with_arrow:   DM Server Role(s) or User(s)",
                description: "**$dm | <@user_id> <@role_id> | <Enter the message>\n\n**To send a **Direct Message** to any role(s) or any no: of users at the same time by **InoBot**.  This command will also notify the message delivery in the <#883465290556530748> channel."
            }, {
                name: "editProfile",
                color: "#2c2cff",
                title: ":page_facing_up:   Update Inovus Profiles",
                description: "Type **/edit-profile**\n\nSend the message to <@842062518675439617> via DM. This command will update your **Inovus Profiles** or generates the profile if it doesn\'t exists.\n\n> Note :\n> You\'ll have to switch to the same **Google Account** that you have used to submit the **Google Form** initially, every time to **Edit the Response**."
            }
        ];

        var embedMessage;
        
        data.forEach(embed => {
            embedMessage = new Discord.MessageEmbed()
                .setColor(embed.color)
                .setTitle(embed.title)
                .setDescription(embed.description)
            message.channel.send(embedMessage)
        });

    }
}