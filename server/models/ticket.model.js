const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { ticketTypes } = require('../config/ticketTypes');

const ticketSchema = mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ticketTypes,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  img: {
    data: Buffer,
    type: String,
    required: true,
  },
});

// add plugin that converts mongoose to json
ticketSchema.plugin(toJSON);
ticketSchema.plugin(paginate);

/**
 * @typedef Ticket
 */
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
