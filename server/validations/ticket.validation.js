const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTicket = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    type: Joi.string().required().valid('year', 'one-time'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    img: Joi.binary().required(),
  }),
};

const updateTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      startDate: Joi.date(),
      endDate: Joi.date(),
      img: Joi.binary(),
    })
    .min(1),
};

const getTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId),
  }),
};

const getTickets = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    type: Joi.string().valid('year', 'one-time'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteTicket = {
  params: Joi.object().keys({
    ticketId: Joi.required().custom(objectId),
  }),
};

const getTicketsForUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createTicket,
  updateTicket,
  getTicket,
  getTickets,
  deleteTicket,
  getTicketsForUser,
};
