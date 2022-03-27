module.exports = {
    name: "/dmUser",
    // description : "",
    execute(client, message, TARGET_ROLE, args) {

        // console.log(TARGET_ROLE);
        var users = TARGET_ROLE.split(/[ ]+/);
        // console.log(users);
        users.forEach(user => {

            if (message.guild.roles.cache.find(x => x.id === user)) {
                if (typeof role === undefined) {

                    message.reply('\nSorry! The role does not exist!');

                } else {

                    // console.log(`${user} - Role exist`);
                    users.pop(user);
                    // console.log(users);
                    users.push(message.guild.roles.cache.get(user).members.map(m => m.user.id));

                }

            } else {
                // console.log(`${user} - User exists`);
                // users.push(user);
            }
        });
        // console.log(users);
        var updatedUsers = users.flat(1);
        // console.log(updatedUsers);

        updatedUsers.forEach(user => {
            client.users.cache.get(user).send(args);
            client.channels.cache.get(process.env.TARGET_CHANNEL).send(`The message has been delivered to <@${user}>`);

        })
    }
}