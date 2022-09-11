module.exports = {
    name : "/profile",
    // description : "",
    execute(message) {
        message.reply(`Welcome <@${message.author.id}> to Inovus Profiles!\n`).then(msg => {
            msg.delete({ timeout: 25000 })
        });
        message.reply(`Please make sure that you fill-up this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSf6PhcChyLvzUKmqkQG5QpEuZqUsSjQJo1yOcmMy54grL3Zmg/viewform?usp=pp_url&entry.633738056=` + message.author.id + `\n\n> You can update your profile by generating the link again.\n> This message will be deleted in 25 seconds.\n** **`).then(msg => {
            msg.delete({ timeout: 25000 })
        });
    }
}