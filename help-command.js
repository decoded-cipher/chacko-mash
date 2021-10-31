module.exports = {
    name : "/help-command",
    // description : "",
    execute(message, Discord) {
        var newEmbed = new Discord.MessageEmbed()
        .setColor('#4b9fc3')
        .setTitle('Onam Wishes from Inovus Labs IEDC')
        .setURL('https://inovus-labs.web.app')
        .setDescription('Wishing you a life as Colourful as Pookalam, as festive as this Onam Festival, and as prosperous as the Bountiful Harvest. \n**Happy Onam to you!** \n\nOn the occasion of Onam, I pray that your life is filled with Abundance, Happiness, and Success. \n**Onam greetings to you & your family.**')
        .setImage('https://cdn.discordapp.com/attachments/844829664405225482/878453861390647296/130306445-3b1a60f6-8d12-418e-91e9-88b9d85f9e6f.jpg')
        .setFooter('I\'m a bot, don\'t reply to me.')

        message.channel.send(newEmbed)
    }
} 