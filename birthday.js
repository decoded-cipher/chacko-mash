module.exports = {
    name : "/birthday",
    // description : "",
    execute(client, TARGET_CHANNEL, bDayData, DiscordUserData) {

        for(let key in bDayData){
            // console.log(key);
        
            for(let property in bDayData[key]){
                // console.log(bDayData[key][property]);
                
                var nameInput = bDayData[key]['Full Name']
                var discordIdInput = DiscordUserData.username + '#' + DiscordUserData.discriminator
                var AgeWish = "23rd Birthday"
                
            }
        }
        console.log(nameInput);
        console.log(discordIdInput);
        console.log(AgeWish);

        const fs = require('fs')
        const { createCanvas, loadImage } = require('canvas')

        const width = 850
        const height = 1400

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')


        loadImage('assets/birthday/templates/template_2.jpg').then((image) => {

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
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

        client.channels.cache.get(TARGET_CHANNEL).send({
            files: [`assets/birthday/output.png`]
        })
                
        // console.log(DiscordUserData);
        // console.log(bDayData);
    }
}