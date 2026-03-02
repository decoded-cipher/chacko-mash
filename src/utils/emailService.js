const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
const logger = require('./logger');

class EmailService {
  constructor() {
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email service configuration missing. Email functionality will be disabled.');
      return;
    }
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendHacktoberfestEmail(data) {
    if (!this.transporter) throw new Error('Email service not configured');
    try {
      const templatePath = path.join('./assets/hacktoberfest/hf_emailTemplate.hbs');
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      const html = template({
        name: data.name,
        certificateId: data.certificateId,
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Hacktoberfest 2022 - Certificate of Contribution',
        html,
        attachments: [
          {
            filename: 'certificate.pdf',
            path: './assets/hacktoberfest/certificate.pdf',
            contentType: 'application/pdf',
          },
        ],
      });

      logger.info('Hacktoberfest email sent successfully', {
        name: data.name,
        email: data.email,
        certificateId: data.certificateId,
      });
    } catch (error) {
      logger.error('Failed to send hacktoberfest email:', error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = new EmailService();
