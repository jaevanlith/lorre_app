const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ticketValidation = require('../../validations/ticket.validation');
const ticketController = require('../../controllers/ticket.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(true, 'manageTickets'), validate(ticketValidation.createTicket), ticketController.createTicket)
  .get(auth(true, 'manageTickets'), validate(ticketValidation.getTickets), ticketController.getTickets);

router
  .route('/:ticketId')
  .get(auth(true, 'manageTickets'), validate(ticketValidation.getTicket), ticketController.getTicket)
  .patch(auth(true, 'manageTickets'), validate(ticketValidation.updateTicket), ticketController.updateTicket)
  .delete(auth(true, 'manageTickets'), validate(ticketValidation.deleteTicket), ticketController.deleteTicket);

router
  .route('/get/:userId')
  .get(auth(false, 'manageTickets'), validate(ticketValidation.getTicketsForUser), ticketController.getTicketsForUser);

router
  .route('/verify/:ticketId')
  .get(auth(true, 'manageTickets'), validate(ticketValidation.getTicket), ticketController.verifyTicket);

module.exports = router;
