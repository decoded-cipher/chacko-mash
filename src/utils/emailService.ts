import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { HacktoberfestData } from '../types';
import logger from './logger';

class EmailService {
  private transporter?: nodemailer.Transporter;

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

  async sendHacktoberfestEmail(data: HacktoberfestData): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const templatePath = path.join('./assets/hacktoberfest/hf_emailTemplate.hbs');
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);

      const html = template({
        name: data.name,
        certificateId: data.certificateId,
        year: new Date().getFullYear(),
      });

      const mailOptions = {
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
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Hacktoberfest email sent successfully', { 
        name: data.name, 
        email: data.email, 
        certificateId: data.certificateId 
      });
    } catch (error) {
      logger.error('Failed to send hacktoberfest email:', error);
      throw new Error('Failed to send email');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        logger.warn('Email service not configured');
        return false;
      }
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService(); 