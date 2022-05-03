module.exports = {
    name: "/bdayNotify",
    // description : "",
    async execute(client, birthdayData, memberData, moment, Discord) {
        var utc = new Date();
        console.log(utc);
        var nowMonth = moment(utc).utcOffset("+05:30").format("M");
        var nowDay = moment(utc).utcOffset("+05:30").format("D");

        // console.log(nowMonth, nowDay);

        await birthdayData.once('value', async (snapshot) => {
            var bDayData = await snapshot.val();
            // console.log(bDayData);
            for (var key in bDayData) {
                var bDayMonth = bDayData[key].Month;
                var bDayDay = bDayData[key].Day;
                if (bDayMonth == nowMonth && bDayDay == nowDay) {
                    // console.log(bDayData[key]);
                    // console.log(key);

                    memberData.orderByChild("Discord User ID").equalTo(key).on('value', async snapshot => {
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
                                // console.log(nameInput);
                                
                                var successPost = new Discord.MessageEmbed()
                                    .setColor('#28a745')
                                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${name}** - <@${id}>\n> $bday | #general | ${id}\n.`)
                                    .setFooter('Copy & Paste the command to generate Birthday Day Wish')
                                client.channels.cache.get(process.env.TARGET_CHANNEL).send(successPost);

                            } else {
                                // console.log(nameInput);

                                var errorPost = new Discord.MessageEmbed()
                                    .setColor('#c25827')
                                    .setTitle(':ribbon:   Birthday Notification   :ribbon:')
                                    .setDescription(`Hey, did you know!\nSomeone here on our server is celebrating their birthday today!\n\n> **${name}** - <@${id}>\n> ${dept}\n.`)
                                    .addFields({
                                        name: ':warning:   Urgent Notification   :warning:',
                                        value: `.\nInform <@${id}> to update profile pic, so that he/she can have a **Birthday Wish Card**, the next year!`,
                                    })
                                    .setFooter('Unfortunately, Birthday Wish Card can\'t be generated!')
                                client.channels.cache.get(process.env.TARGET_CHANNEL).send(errorPost);
                            }
                        }

                    });
                }
            }
        })

    }
}