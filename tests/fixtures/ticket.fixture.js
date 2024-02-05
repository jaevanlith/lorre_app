const mongoose = require('mongoose');
const faker = require('faker');
const Ticket = require('../../server/models/ticket.model');
const { userOne, userTwo } = require('./user.fixture');
const { ticketTypes } = require('../../server/config/ticketTypes');

const ticketOne = {
  _id: mongoose.Types.ObjectId(),
  userId: mongoose.Types.ObjectId(),
  type: faker.random.arrayElement(ticketTypes),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  img: faker.image.dataUri(),
};

const ticketTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: mongoose.Types.ObjectId(),
  type: faker.random.arrayElement(ticketTypes),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  img: faker.image.dataUri(),
};

const userTicketOne = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  type: faker.random.arrayElement(ticketTypes),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  img: faker.image.dataUri(),
};

const userTicketTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: userTwo._id,
  type: faker.random.arrayElement(ticketTypes),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  img: faker.image.dataUri(),
};

const insertTickets = async (tickets) => {
  await Ticket.insertMany(tickets.map((ticket) => ({ ...ticket })));
};

module.exports = {
  ticketOne,
  ticketTwo,
  userTicketOne,
  userTicketTwo,
  insertTickets,
};
