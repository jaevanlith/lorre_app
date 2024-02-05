const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ticketService } = require('../services');

const createTicket = catchAsync(async (req, res) => {
  const ticket = await ticketService.createTicket(req.body);
  res.status(httpStatus.CREATED).send(ticket);
});

const getTickets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'type', 'startDate', 'endDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await ticketService.queryTickets(filter, options);
  res.send(result);
});

const getTicket = catchAsync(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  res.send(ticket);
});

const updateTicket = catchAsync(async (req, res) => {
  const ticket = await ticketService.updateTicketById(req.params.ticketId, req.body);
  res.send(ticket);
});

const deleteTicket = catchAsync(async (req, res) => {
  await ticketService.deleteTicketById(req.params.ticketId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTicketsForUser = catchAsync(async (req, res) => {
  const tickets = await ticketService.getTicketsForUser(req.params.userId);
  res.send(tickets);
});

const verifyTicket = catchAsync(async (req, res) => {
  const message = await ticketService.verifyTicket(req.params.ticketId);
  res.send(message);
});

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getTicketsForUser,
  verifyTicket,
};
