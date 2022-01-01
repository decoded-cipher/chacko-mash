module.exports = {
    name : "/private",
    // description : "",
    execute(message, Discord) {
        var newEmbed = new Discord.MessageEmbed()
        .setColor('#6c9380')
        .setTitle('Happy New Year | Inovus Labs IEDC')
        .setURL('https://inovuslabs.org')
        .setDescription('*“We are opening a new book. Its pages are blank. We are gonna put words on them ourselves. The book is called **Opportunity** & its first chapter is the **New Year Day**”*\n\n> We wish that the coming year brings to you more strength & dedication to achieve all your goals with your commitment & smart work. :dove:\n\nWishing you a **Happy New Year** with the hope that you will have many blessings in the year to come. :sparkles:')
        .setImage('https://media.discordapp.net/attachments/843216992521158706/926547615506657340/Instagram_post_-_5.png')
        .setFooter('I\'m a bot, don\'t reply to me.')

        message.guild.members.cache.forEach(member => {
            member.send(newEmbed)
                .catch(e => {
                    console.error(`Couldn't message ${member.user.tag}`)
                })
        })
    }
} 