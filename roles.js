module.exports = {
    name : "/roles",
    // description : "",
    execute(client, message, TARGET_ROLE, args) {
        // console.log(TARGET_ROLE);
        // console.log(args);

        var role = message.guild.roles.cache.find(r => r.id === TARGET_ROLE);
        // console.log(role);

        var users = args.split(/[ ]+/);
        users.forEach(user => {
            user = user.replace(/[^0-9]/g, '');
            // console.log(user);

            // user.roles.add(role);
            message.guild.member(user).roles.add(role);
            client.channels.cache.get(process.env.TARGET_CHANNEL).send(`<@${user}> has been given the role <@&${role.id}>`);
        });
    }
} 
