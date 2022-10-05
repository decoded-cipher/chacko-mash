var api = require("../apiClient")
var imageGenerator = require("../utilities/imageGenerator")
var sendEmail = require("../utilities/sendEmail")

module.exports = {
    name : "/hacktoberfest",
    // description : "",
    async execute(client, message, reaction, user, Discord) {
        
        await api.getHacktoberfestData().then( async(certificates) => {

            Array.isArray(certificates) ? certificates = certificates : certificates = [];
            
            var data = {
                id: reaction.message.author.id,
                certificateId : 'INO2022HBF' + (certificates.length + 1).toString().padStart(3, '0')
            }

            await api.getExtUserData(data.id).then((userData) => {
                
                data.name = userData.name;
                data.email = userData.email;
                
                // Generate Certificate
                imageGenerator.execute(data);

            }).catch((error) => {
                console.log(error);
            })

            await api.postHacktoberfestData(
                {
                    id: data.id,
                    certificateId: data.certificateId
                }
            ).then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            })

            // Send Email
            sendEmail.execute(data, Discord, client);

            var ServerPost = new Discord.MessageEmbed()
                .setColor('#9092ff')
                .setTitle(':cloud_lightning:   Hacktoberfest Certificate Generated   :cloud_lightning:')
                .setDescription(`> **${data.name}**\n> ${data.email}\n> ${data.id}\n\n**Certificate ID :** ${data.certificateId}\n**Approver :** ${user}`)

            var UserPost = new Discord.MessageEmbed()
                .setColor('#9092ff')
                .setTitle(':cloud_lightning:   Hacktoberfest 2022 | Inovus Labs IEDC   :cloud_lightning:')
                .setDescription(`** **\nHurray!\nYou have successfully contributed to an Open-source Repository maintained by **Inovus Labs** during this **Hacktoberfest** Season.  :sparkles:\n\nA small token of appreciation in the format of a **Certificate of Contribution** has been sent to the below-mentioned Email Address.  :sparkles:\n\n> Name : **${data.name}**\n> Email : **${data.email}**\n\n> Certificate ID : **${data.certificateId}**\n\nIf the certificate is not received in 15 minutes, contact the **Server Moderator** or **X-Men**.\n\n\n** **`)
                .setFooter('I\'m a bot, don\'t reply to me.')

            await client.users.cache.get(data.id).send(UserPost);
            await client.channels.cache.get(process.env.TARGET_CHANNEL).send(ServerPost);

        }).catch((error) => {
            console.log(error);
        })
    }
}