module.exports = {
    name : "/birthday",
    // description : "",
    execute(message) {

        const fs = require('fs')
        const { createCanvas, loadImage } = require('canvas')

        const width = 850
        const height = 1400

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        var nameInput = "Leya Elezabeth Thomas"
        var discordIdInput = "Leya Thomas#6923"
        var AgeWish = "19th Birthday"

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

        message.channel.send({
            files: [`assets/birthday/output.png`]
        })
    }
}