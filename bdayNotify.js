var api = require('./apiClient.js')
var CronJob = require('cron').CronJob;

module.exports = {
    name: "/bdayNotify",
    // description : "",
    async execute(client, users, Discord) {

        var job = new CronJob('50 1 * * *', async() => {

            for (let user in users) {
                await api.getExtUserData(users[user]).then(async (extUser) => {

                    var successPost = new Discord.MessageEmbed()
                        .setColor('#28a745')
                        .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                        .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${extUser.name}** - <@${extUser._id}>\n> $bday | #general | ${extUser._id}\n.`)
                        .setFooter('Copy & Paste the command to generate Birthday Day Wish')

                    var errorPost = new Discord.MessageEmbed()
                        .setColor('#c25827')
                        .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                        .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${extUser.name}** - <@${extUser._id}>\n> ${extUser.department}\n.`)
                        .addFields({
                            name: ':warning:   Urgent Notification   :warning:',
                            value: `.\nInform <@${extUser._id}> to update profile pic, so that he/she can have a **Birthday Wish Card**, the next year!`,
                        })
                        .setFooter('Unfortunately, Birthday Wish Card can\'t be generated!')

                    var avatar = await extUser.discord.avatar.split('/').pop()

                    if (avatar != 'null.png') {
                        await client.channels.cache.get(process.env.TARGET_CHANNEL).send(successPost);
                    } else {
                        await client.channels.cache.get(process.env.TARGET_CHANNEL).send(errorPost);
                    }

                }).catch((error) => {
                    console.log(error);
                })
            }
            
        }, null, true, 'Asia/Kolkata');
    }
}