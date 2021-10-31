const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

const width = 850
const height = 1400

const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

var nameInput = "Arjun Krishna"
var discordIdInput = "ArjunKrishna#9445"
var AgeWish = "23rd Birthday"

loadImage('Bday_Wish/Test-Image-1.jpg').then((image) => {

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
	ctx.fillStyle = '#000'
    ctx.textAlign = "center";
	
    ctx.font = '48px Cinzel, serif'
	ctx.fillText(nameInput, 425, 870)
    
    ctx.font = '25px Cinzel, serif'
	ctx.fillText(discordIdInput, 425, 910)

    ctx.font = '96px Alex Brush, cursive'
	ctx.fillText(AgeWish, 425, 1190)
  
    var buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('Bday_Wish/output.png', buffer)
})
