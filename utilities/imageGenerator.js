module.exports = {
    name : "/imageGenerator",
    execute(data) {

        const fs = require('fs')
        const { registerFont, createCanvas, loadImage } = require('canvas')

        // registerFont('./assets/fonts/Gilroy-SemiBold.ttf', { family: 'Gilroy SemiBold' })

        const width = 1920
        const height = 1080

        const canvas = createCanvas(width, height, 'pdf')
        const ctx = canvas.getContext('2d')

        loadImage('assets/hacktoberfest/templates/template_1.png').then((image) => {

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

            ctx.save();
            ctx.beginPath();

            ctx.fillStyle = '#000'
            ctx.textAlign = "center";

            ctx.font = '55px Gilroy SemiBold, sans-serif'
            ctx.fillStyle = '#64E3FF'
            ctx.fillText(data.name, 960, 586)

            ctx.translate(1235, 585);
            ctx.rotate(90 * Math.PI / 180);
            ctx.translate(-1235, -585);

            ctx.font = '75px Gilroy SemiBold, sans-serif'
            ctx.fillStyle = '#E5E1E626'
            ctx.fillText(data.certificateId, 1190, 17)

            var buffer = canvas.toBuffer('application/pdf')
            fs.writeFileSync('assets/hacktoberfest/certificate.pdf', buffer)
        })
    }
}