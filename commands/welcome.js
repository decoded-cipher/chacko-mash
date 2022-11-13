module.exports = {
    name : "/welcome",
    // description : "",
    execute(client, guildMember) {
        var welcomeImages = [
            "https://user-images.githubusercontent.com/44474792/126882769-2c86e588-8172-4c76-b41c-d8a0db5bdb56.png",
            "https://user-images.githubusercontent.com/44474792/126882807-2f2646a8-c984-472f-b0b5-f7a063958b6a.jpg",
            "https://user-images.githubusercontent.com/44474792/126882789-e8482f11-cb5b-4e8f-86ea-4ec5184c2db6.jpg",
            "https://user-images.githubusercontent.com/44474792/126882790-76c2109a-df80-4971-8741-ae3b42c78b23.jpg",
            "https://user-images.githubusercontent.com/44474792/126882794-1526d5e0-5acd-4abb-aad4-e25704562348.jpg",
            "https://user-images.githubusercontent.com/44474792/126882802-8a014326-59dd-45ca-9c56-92aea2961428.jpg",
            "https://user-images.githubusercontent.com/44474792/122104658-87b05180-ce35-11eb-8671-db90c37baead.jpg"
        ]
        var randomIndex = Math.floor(Math.random() * welcomeImages.length);
        
        guildMember.guild.channels.cache.get(process.env.LOBBY_CHANNEL).send(`Welcome <@${guildMember.user.id}> to Inovus Labs IEDC Discord Server!\n`, {
            files: [`${welcomeImages[randomIndex]}`]
        });
        
        guildMember.roles.add(process.env.WELCOME_ROLE);
        client.users.cache.get(guildMember.user.id).send(`:tada: Welcome to the **Inovus Labs** Student Community :tada:\n\nHey There,\nPlease make sure that you fill-up this form:\nhttps://docs.google.com/forms/d/e/1FAIpQLSeXyH_5QqA8hYPems_uDvljsqjBadrSFuQ1NwdoubkOTV31WA/viewform?usp=pp_url&entry.1728088991=${guildMember.user.id} \n\nPlease don't forget to follow us on Social Medias.\n> Instagram : https://instagram.com/inovuslabs \n> Twitter : https://twitter.com/inovuslabs \n> LinkedIn : https://linkedin.com/company/inovuslabs \n** **`);
    }
}