const fs = require('fs/promises');
const path = require('path');
const { registerFont, createCanvas, loadImage } = require('canvas');
const logger = require('./logger');

class ImageGenerator {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.registerFonts();
  }

  registerFonts() {
    try {
      registerFont('./assets/fonts/Gilroy-SemiBold.ttf', { family: 'Gilroy SemiBold' });
      registerFont('./assets/fonts/LithosPro-Regular.otf', { family: 'Lithos Pro Regular' });
      registerFont('./assets/fonts/alex-brush.regular.ttf', { family: 'Alex Brush' });
      logger.success('Fonts registered successfully');
    } catch (error) {
      logger.errorWithContext('Failed to register fonts', error);
    }
  }

  async generateHacktoberfestCertificate(data) {
    try {
      const canvas = createCanvas(this.width, this.height, 'pdf');
      const ctx = canvas.getContext('2d');
      const templatePath = path.join('./assets/hacktoberfest/templates/template_1.png');
      const image = await loadImage(templatePath);

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = '#64E3FF';
      ctx.textAlign = 'center';
      ctx.font = '55px Gilroy SemiBold, sans-serif';
      ctx.fillText(data.name, 960, 586);

      ctx.translate(1235, 585);
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(-1235, -585);
      ctx.font = '75px Gilroy SemiBold, sans-serif';
      ctx.fillStyle = '#E5E1E626';
      ctx.fillText(data.certificateId, 1190, 17);
      ctx.restore();

      const buffer = canvas.toBuffer('application/pdf');
      const outputPath = './assets/hacktoberfest/certificate.pdf';
      await fs.writeFile(outputPath, buffer);
      logger.success(`Hacktoberfest certificate generated successfully for ${data.name}`);
      return outputPath;
    } catch (error) {
      logger.errorWithContext('Failed to generate hacktoberfest certificate', error);
      throw new Error('Failed to generate certificate');
    }
  }

  async generateBirthdayImage(userData) {
    try {
      const canvas = createCanvas(850, 1400);
      const ctx = canvas.getContext('2d');
      const age = new Date().getFullYear() - userData.dob.year;
      const ageWish = this.getAgeWish(age);
      const template = userData.gender === 'Male' ? 'template_3.jpg' : 'template_2.jpg';

      const [avatar, templateImage] = await Promise.all([
        loadImage(userData.discord.avatar),
        loadImage(`./assets/birthday/templates/${template}`),
      ]);

      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(425.5, 633.5, 152.5, 0, 2 * Math.PI, false);
      ctx.clip();
      ctx.drawImage(avatar, 273, 481, 305, 305);
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#39393B';
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.font = '48px Lithos Pro Regular, sans-serif';
      ctx.fillText(userData.name, 425, 870);
      ctx.font = '25px Lithos Pro Regular, sans-serif';
      ctx.fillText(userData.discord.tag, 425, 910);
      ctx.font = '96px Alex Brush, cursive';
      ctx.fillText(ageWish, 420, 1190);

      const buffer = canvas.toBuffer('image/png');
      const outputPath = './assets/birthday/output.png';
      await fs.writeFile(outputPath, buffer);
      logger.success(`Birthday image generated successfully for ${userData.name} (age: ${age})`);
      return outputPath;
    } catch (error) {
      logger.errorWithContext('Failed to generate birthday image', error);
      throw new Error('Failed to generate birthday image');
    }
  }

  getAgeWish(age) {
    const lastDigit = age % 10;
    const suffix = lastDigit === 1 ? 'st' : lastDigit === 2 ? 'nd' : lastDigit === 3 ? 'rd' : 'th';
    return `${age}${suffix} Birthday`;
  }
}

module.exports = new ImageGenerator();
