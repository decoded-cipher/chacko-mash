module.exports = {
    name: "/birthday",
    // description : "",
    async execute(client, TARGET_CHANNEL, bDayData, DiscordUserData) {

        for (let key in bDayData) {
            // console.log(key);

            for (let property in bDayData[key]) {
                // console.log(bDayData[key][property]);

                var nameInput = bDayData[key]['Full Name']
                var discordIdInput = DiscordUserData.username + '#' + DiscordUserData.discriminator

                var birthYear = new Date(bDayData[key]['Date of Birth']).getFullYear();

                var avatarImage = `https://cdn.discordapp.com/avatars/${DiscordUserData.id}/${DiscordUserData.avatar}.png`
                var gender = bDayData[key]['Gender']
                // var discordAvatar = DiscordUserData.username
            }
        }

        var presentYear = new Date().getFullYear();
        var age = presentYear - birthYear
        console.log(age);

        switch (age % 10) {
            case 1:
                AgeWish = age + "st Birthday";
                break;
            case 2:
                AgeWish = age + "nd Birthday";
                break;
            case 3:
                AgeWish = age + "rd Birthday";
                break;
            default:
                AgeWish = age + "th Birthday";
        }

        // console.log(nameInput);
        // console.log(discordIdInput);
        // console.log(AgeWish);
        // console.log(avatarImage);

        const fs = require('fs')
        const { registerFont, createCanvas, loadImage } = require('canvas')

        registerFont('./assets/fonts/LithosPro-Regular.otf', { family: 'Lithos Pro Regular' })
        registerFont('./assets/fonts/alex-brush.regular.ttf', { family: 'Alex Brush' })

        const width = 850
        const height = 1400

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        var designTemplate = ''
        gender == 'Male' ? designTemplate = 'template_3.jpg' : designTemplate = 'template_2.jpg';

        await loadImage(avatarImage).then(async(avatar) => {

            await loadImage(`assets/birthday/templates/${designTemplate}`).then(async (image) => {

                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

                ctx.save();
                ctx.beginPath();

                ctx.arc(425.5, 633.5, 152.5, 0, 2 * Math.PI, false);
                ctx.clip();
                ctx.drawImage(avatar, 273, 481, 305, 305)
                ctx.restore();

                ctx.lineWidth = 8;
                ctx.strokeStyle = '#39393B';
                ctx.stroke();

                ctx.fillStyle = '#000'
                ctx.textAlign = "center";

                ctx.font = '48px Lithos Pro Regular, sans-serif'
                ctx.fillText(nameInput, 425, 870)

                ctx.font = '25px Lithos Pro Regular, sans-serif'
                ctx.fillText(discordIdInput, 425, 910)

                ctx.font = '96px Alex Brush, cursive'
                ctx.fillText(AgeWish, 420, 1190)

                var buffer = canvas.toBuffer('image/png')
                fs.writeFileSync('assets/birthday/output.png', buffer)
            })

        })

        await client.channels.cache.get(TARGET_CHANNEL).send(`“This birthday, I wish you abundant happiness and love. May all your dreams turn into reality and may lady luck visit your home today. Happy birthday <@${DiscordUserData.id}>.”`)

        await client.channels.cache.get(TARGET_CHANNEL).send(`https://tenor.com/view/simhavalan-menon-jagathy-malayalam-happy-birthday-santhosha-janmadinam-kuttikku-gif-17580455`)

        await client.channels.cache.get(TARGET_CHANNEL).send({
            files: [`assets/birthday/output.png`]
        })

        // console.log(DiscordUserData);
        // console.log(bDayData);
    }
}