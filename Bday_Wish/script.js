const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const downloadBtn = document.getElementById('download-btn')

const image = new Image()
image.src = 'Test-Image-1.jpg'
image.onload = function () {
	drawImage()
}

var nameInput = "Arjun Krishna"
var discordIdInput = "ArjunKrishna#9445"
var AgeWish = "23rd Birthday"

function drawImage() {
	// ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
	ctx.fillStyle = '#000'
    ctx.textAlign = "center";
	
    ctx.font = '48px Cinzel, serif'
	ctx.fillText(nameInput, 425, 870)
    
    ctx.font = '25px Cinzel, serif'
	ctx.fillText(discordIdInput, 425, 910)

    ctx.font = '96px Alex Brush, cursive'
	ctx.fillText(AgeWish, 425, 1190)
}

downloadBtn.addEventListener('click', function () {
	downloadBtn.href = canvas.toDataURL('image/jpg')
	downloadBtn.download = 'Certificate - ' + nameInput.value
})