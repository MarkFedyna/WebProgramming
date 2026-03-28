const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const { Resend } = require('resend');
const { BadRequest } = require('@feathersjs/errors');
require('dotenv').config();

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(express.rest());

app.use('/', express.static('public'));

const resend = new Resend(process.env.RESEND_API_KEY);

class ContactService {
  async create(data) {
    const { name, email, subject, message } = data;

    if (!name || !email || !subject || !message) {
      throw new BadRequest('Усі поля (ім’я, email, тема, повідомлення) є обов’язковими.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequest('Некоректний формат email.');
    }

    if (name.length < 2) {
      throw new BadRequest('Ім’я повинно бути не менше 2 символів.');
    }

    if (message.length < 5) {
      throw new BadRequest('Повідомлення повинно бути не менше 5 символів.');
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Contact Form <onboarding@resend.dev>',
        to: process.env.EMAIL || 'markfedina5@gmail.com',
        subject: `${subject}`,
        html: `
          <h3>Нове повідомлення з форми зворотного зв'язку</h3>
          <p><strong>Від:</strong> ${name} (${email})</p>
          <p><strong>Тема:</strong> ${subject}</p>
          <p><strong>Повідомлення:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
        replyTo: email
      });

      if (error) {
        console.error('Resend API Error:', error);
        throw new Error('Помилка при відправці пошти через Resend.');
      }

      console.log('Resend API Success. Message ID:', data.id);
      return { status: 'success', message: 'Лист успішно відправлено!', messageId: data.id };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Помилка при відправці пошти.');
    }
  }
}

app.use('/api/contact', new ContactService());

app.use(express.errorHandler());

const port = process.env.PORT || 4000;
app.listen(port).then(() => {
  console.log(`\nFeathers server running at: http://localhost:${port}`);
  console.log(`Contact endpoint: POST http://localhost:${port}/api/contact\n`);
  console.log(`Для публічного доступу запустіть: npm run tunnel`);
});
