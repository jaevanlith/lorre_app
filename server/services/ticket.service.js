const httpStatus = require('http-status');
const { addYears, isBefore, format, addWeeks, startOfDay, endOfDay } = require('date-fns');
const { Ticket } = require('../models');
const userService = require('./user.service');
const checkInService = require('./checkIn.service');
const emailService = require('./email.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a ticket
 * @param {Object} ticketBody
 * @returns {Promise<Ticket>}
 */
const createTicket = async (ticketBody) => {
  const user = await userService.getUserById(ticketBody.userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User doesnt exist');
  }

  let startDate;
  if (!ticketBody.startDate) {
    startDate = Date.now();
  } else startDate = ticketBody.startDate;

  let endDate;
  if (!ticketBody.endDate) {
    endDate = addYears(startDate, 1);
  } else endDate = ticketBody.endDate;

  const ticket = await Ticket.create({
    userId: ticketBody.userId,
    type: ticketBody.type,
    startDate,
    endDate,
    img: ticketBody.img,
  });
  return ticket;
};

/**
 * Query for tickets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTickets = async (filter, options) => {
  const tickets = await Ticket.paginate(filter, options);
  return tickets;
};

/**
 * Get ticket by id
 * @param {ObjectId} id
 * @returns {Promise<Ticket>}
 */
const getTicketById = async (id) => {
  return Ticket.findById(id);
};

/**
 * Update ticket by id
 * @param {ObjectId} ticketId
 * @param {Object} updateBody
 * @returns {Promise<Ticket>}
 */
const updateTicketById = async (ticketId, updateBody) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  Object.assign(ticket, updateBody);
  await ticket.save();
  return ticket;
};

/**
 * Delete ticket by id
 * @param {ObjectId} ticketId
 * @returns {Promise<Ticket>}
 */
const deleteTicketById = async (ticketId) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  await ticket.remove();
  return ticket;
};

/**
 * Gets all tickets for the given user
 * @param userId
 * @returns {Promise<result>}
 */
const getTicketsForUser = async (userId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User doesnt exist');
  }
  const tickets = await Ticket.find({ userId });
  return tickets;
};

/**
 * Verifies whether a ticket is valid and checks a user in if yes
 * @param ticketId
 * @returns {Promise<string>} A success or fail message, and a reason why in case of failure
 */
const verifyTicket = async (ticketId) => {
  // Check if ticket exists
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    return 'Mislukt - Ongeldige QR code';
  }

  // Check if ticket is expired
  if (isBefore(ticket.endDate, Date.now())) {
    const formattedDate = format(ticket.endDate, "dd/MM/yyyy 'om' HH:mm 'uur'");
    if (ticket.type === 'one-time') {
      return `Mislukt - Ticket is al gebruikt op ${formattedDate}`;
    }
    return `Mislukt - Ticket is verlopen op ${formattedDate}`;
  }

  const user = await userService.getUserById(ticket.userId);
  if (!user) {
    return 'Mislukt - Gebruiker niet gevonden';
  }

  // Check if user is already checked in
  if (user.isCheckedIn) {
    return 'Mislukt - Gebruiker is al ingecheckt';
  }

  // Now the ticket is confirmed to be valid, start check-in process
  const checkIn = await checkInService.checkInUser(user, ticket);
  if (!checkIn) {
    return 'Er is iets misgegaan, probeer opnieuw';
  }

  return 'Inchecken gelukt';
};

/**
 * Gets all tickets that expire 2 weeks from the current date and sends a reminder to the user through email
 * @returns {Promise}
 */
const twoWeekExpirationNotification = async () => {
  // set up dates
  const currentDate = Date.now();
  const expirationDate = addWeeks(currentDate, 2);
  const startDay = startOfDay(expirationDate);
  const endDay = endOfDay(expirationDate);

  // find tickets
  const tickets = await Ticket.find({ endDate: { $gte: startDay, $lte: endDay } });

  // send emails
  const promises = [];
  for (let i = 0; i < tickets.length; i += 1) {
    promises.push(emailService.reminderTicketExpirationEmail(tickets[i]));
  }
  await Promise.all(promises);
};

module.exports = {
  createTicket,
  queryTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
  getTicketsForUser,
  verifyTicket,
  twoWeekExpirationNotification,
};
