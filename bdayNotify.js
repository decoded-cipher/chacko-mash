module.exports = {
    name: "/bdayNotify",
    // description : "",
    execute(client, birthdayData, memberData, moment, Discord, IST) {

        var nowMonth = moment(IST).format("M");
        var nowDay = moment(IST).format("D");

        // console.log(nowMonth, nowDay);

        birthdayData.once('value', async (snapshot) => {
            var bDayData = await snapshot.val();
            // console.log(bDayData);
            for (var key in bDayData) {
                var bDayMonth = bDayData[key].Month;
                var bDayDay = bDayData[key].Day;
                if (bDayMonth == nowMonth && bDayDay == nowDay) {
                    // console.log(bDayData[key]);
                    // console.log(key);

                    await memberData.orderByChild("Discord User ID").equalTo(key).on('value', async snapshot => {
                        var memberData = await snapshot.val();
                        // console.log(memberData);

                        for (let key in memberData) {
                            // console.log(key);

                            for (let property in memberData[key]) {
                                var name = memberData[key]['Full Name']
                                var id = memberData[key]['Discord User ID']
                                var dept = memberData[key]['Department']
                            }

                            var DiscordUserData = await client.users.fetch(key);
                            if (DiscordUserData.avatarURL() != null) {
                                console.log("Success Post Generated!");
                                
                                var successPost = new Discord.MessageEmbed()
                                    .setColor('#28a745')
                                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${name}** - <@${id}>\n> $bday | #general | ${id}\n.`)
                                    .setFooter('Copy & Paste the command to generate Birthday Day Wish')
                                await client.channels.cache.get(process.env.TARGET_CHANNEL).send(successPost);
                                console.log("Success Post Sent to " + process.env.TARGET_CHANNEL);

                            } else {
                                console.log("Error Post Generated!");

                                var errorPost = new Discord.MessageEmbed()
                                    .setColor('#c25827')
                                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${name}** - <@${id}>\n> ${dept}\n.`)
                                    .addFields({
                                        name: ':warning:   Urgent Notification   :warning:',
                                        value: `.\nInform <@${id}> to update profile pic, so that he/she can have a **Birthday Wish Card**, the next year!`,
                                    })
                                    .setFooter('Unfortunately, Birthday Wish Card can\'t be generated!')
                                await client.channels.cache.get(process.env.TARGET_CHANNEL).send(errorPost);
                                console.log("Error Post Sent to " + process.env.TARGET_CHANNEL);
                            }
                        }

                    });
                }
            }
        })

    }
}