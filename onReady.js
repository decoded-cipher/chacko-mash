module.exports = {
    name : "/onReady",
    // description : "",
    execute(client) {

        client.user.setPresence({
            status: 'online',
            activity: {
                name: 'over Inovus Labs',
                type: 'WATCHING'
            }
        })
        
        console.log(`Logged in as ${client.user.username}!`);
        client.channels.cache.get(process.env.LOBBY_CHANNEL).send('š')
        client.channels.cache.get(process.env.LOBBY_CHANNEL).send(`Hey fellas, I\'m back online.\nSorry for the little nap!\nš`, {
            files: ['https://user-images.githubusercontent.com/44474792/126882345-a229f1c8-0ad6-455e-b2e4-eba1b580cb2e.jpg']
        })
    }
}