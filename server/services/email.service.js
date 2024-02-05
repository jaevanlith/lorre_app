const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const config = require('../config/config');
const logger = require('../config/logger');
const userService = require('./user.service');

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const user = await userService.getUserByEmail(to);
  const name = user.firstName;
  const subject = 'Wachtwoord wijzigen';
  // reset password page of the front-end app
  const resetPasswordUrl = `http://localhost:3000/NewPassword?token=${token}`;
  const html = `<p>Beste ${name},</p>
  <p>Klik hier om je wachtwoord te wijzigen: <a href=${resetPasswordUrl}>Wijzig wachtwoord</a></p>
  <p>Werkt bovenstaande link niet? Kopieer dan de volgende URL in de adresbalk van je webrowser: <br/>${resetPasswordUrl}</p>
  <p>Als je geen verzoek hebt gedaan om je wachtwoord te wijzigen kan je deze email gerust negeren.</p>
  <p>Met vriendelijke groet,
  <br/>Lorre</p>`;
  await sendEmail(to, subject, html);
};

/**
 * Send confirmation of password reset email
 * @param to
 * @returns {Promise}
 */
const confirmPasswordResetEmail = async (to) => {
  const user = await userService.getUserByEmail(to);
  const name = user.firstName;
  const subject = 'Wachtwoord gewijzigd';
  // login page of the front-end app
  const loginURL = `http://localhost:3000`;
  const html = `<p>Beste ${name},</p>
  <p>Je wachtwoord is gewijzigd.</p>
  <p>Klik hier om naar Lorre te gaan: <a href=${loginURL}>Inloggen</a></p>
  <p>Heb je dit niet zelf gedaan? Neem dan zo snel mogelijk contact op met Lorre via <a href=https://lorre.nl/info/contact/>https://lorre.nl/info/contact/</a></p>
  <p>Met vriendelijke groet,
  <br/>Lorre</p>`;
  await sendEmail(to, subject, html);
};

/**
 * Send confirmation of purchase email
 * @param userId
 * @returns {Promise}
 */
const confirmPurchaseEmail = async (userId, ticketType) => {
  const user = await userService.getUserById(userId);
  if (user) {
    const to = user.email;
    const name = user.firstName;
    const subject = 'Bevestiging van je aankoop bij Lorre';
    // ticket overview page of the front-end app
    const ticketsURL = `http://localhost:3000/User/Overview`;

    let type;
    if (ticketType === 'year') {
      type = 'jaar';
    }
    if (ticketType === 'one-time') {
      type = 'eenmalige ';
    }

    const html = `<p>Beste ${name},</p>
    <p>Bedankt voor je aankoop van een ${type}ticket bij Lorre.</p>
    <p>Bekijk hier je tickets: <a href=${ticketsURL}>Ticket overzicht</a></p>
    <p>We hopen je snel bij Lorre te zien!</p>
    <p>Met vriendelijke groet,
    <br/>Lorre</p>`;
    await sendEmail(to, subject, html);
  }
};

/**
 * Send reminder of ticket expiration email
 * @param ticket
 * @returns {Promise}
 */
const reminderTicketExpirationEmail = async (ticket) => {
  const user = await userService.getUserById(ticket.userId);
  if (user) {
    const to = user.email;
    const name = user.firstName;
    const subject = 'Je ticket vervalt binnenkort!';
    // ticket overview page of the front-end app
    const ticketsURL = `http://localhost:3000/User/Overview`;

    let type;
    if (ticket.type === 'year') {
      type = 'jaar';
    }
    if (ticket.type === 'one-time') {
      type = 'eenmalige ';
    }

    const endDate = format(ticket.endDate, "dd/MM/yyyy HH:mm 'uur'");

    const html = `<p>Beste ${name},</p>
    <p>Je ${type}ticket vervalt binnenkort!</p>
    <p>Je kan de ticket nog gebruiken tot ${endDate}</p>
    <p>Bekijk hier je tickets: <a href=${ticketsURL}>Ticket overzicht</a></p>
    <p>We hopen je snel bij Lorre te zien!</p>
    <p>Met vriendelijke groet,
    <br/>Lorre</p>`;
    await sendEmail(to, subject, html);
  }
};

/**
 * Send ticket expired email
 * @param to
 * @returns {Promise}
 */
const ticketExpirationEmail = async (to) => {
  const user = await userService.getUserByEmail(to);
  const name = user.firstName;
  const subject = 'Je ticket(s) zijn vervallen!';
  // ticket overview page of the front-end app
  const ticketsURL = `http://localhost:3000/User/Overview`;
  // purchase ticket page of the front-end app
  const purchaseURL = `http://localhost:3000/User/BuyPass`;
  const html = `<p>Beste ${name},</p>
  <p>Je ticket is vervallen!</p>
  <p>Bekijk hier je huidige tickets: <a href=${ticketsURL}>Ticket overzicht</a>
  <br/>of klik hier om een nieuwe ticket te kopen: <a href=${purchaseURL}>Ticket kopen</a></p>
  <p>We hopen je snel bij Lorre te zien!</p>
  <p>Met vriendelijke groet,
  <br/>Lorre</p>`;
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  confirmPasswordResetEmail,
  confirmPurchaseEmail,
  reminderTicketExpirationEmail,
  ticketExpirationEmail,
};
