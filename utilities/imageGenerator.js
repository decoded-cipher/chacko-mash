module.exports = {
    name : "/imageGenerator",
    execute() {

        const fs = require('fs')
        const { registerFont, createCanvas, loadImage } = require('canvas')

        // registerFont('./assets/fonts/Gilroy-SemiBold.ttf', { family: 'Gilroy SemiBold' })

        const width = 1920
        const height = 1080

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        var data = {
            name : 'Sreelakshmi Anilkumar',
            id : 'INO2022HBF001',
        }

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
            ctx.fillText(data.id, 1190, 17)

            var buffer = canvas.toBuffer('image/png')
            fs.writeFileSync('assets/hacktoberfest/output.png', buffer)
        })
    }
}