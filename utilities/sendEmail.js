var nodemailer = require('nodemailer');
var handlebars = require('handlebars');

var fs = require('fs');
var path = require('path');

var hf_emailTemplate = path.join(__dirname, '../utilities/hf_emailTemplate.hbs');
var emailTemplate = fs.readFileSync(hf_emailTemplate, 'utf-8').toString();

module.exports = {
    name : "/sendEmail",
    execute(data, Discord, client) {

        var template = handlebars.compile(emailTemplate);
        var replacements = {
            name: data.name,
            certificateId: data.certificateId
        };
        var htmlToSend = template(replacements);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        var mailOptions = {
            from: `"Inovus Labs IEDC" <${process.env.EMAIL_USER}>`,
            to: `"${data.name}" <${data.email}>`,
            subject: 'Certificate of Contribution | Hacktoberfest 2022 | Inovus Labs IEDC',
            html: htmlToSend,
            headers: { 'x-myheader': 'test header' },
            attachments: [
                {
                    filename: 'certificate.pdf',
                    path: path.join(__dirname, '../assets/hacktoberfest/certificate.pdf'),
                    // cid: 'certificate'
                }
            ]
        };

        var successPost = new Discord.MessageEmbed()
            .setColor('#28a745')
            .setTitle(':cloud_lightning:   Certificate Delivery Notification   :cloud_lightning:')
            .setDescription(`> **${data.name}**\n> ${data.email}\n\nStatus : **Certificate Delivered Successfully**`)

        var errorPost = new Discord.MessageEmbed()
            .setColor('#c25827')
            .setTitle(':cloud_lightning:   Certificate Delivery Notification   :cloud_lightning:')
            .setDescription(`> **${data.name}**\n> ${data.email}\n\nStatus : **Error while sending Certificate**`)
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                client.channels.cache.get(process.env.TARGET_CHANNEL).send(errorPost);
            } else {
                console.log('Email sent: ' + info.response);
                client.channels.cache.get(process.env.TARGET_CHANNEL).send(successPost);
            }
        });
    }
}