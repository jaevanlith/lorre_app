const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { ticketTypes } = require('../config/ticketTypes');

const paymentDataSchema = mongoose.Schema(
  {
    orderRef: {
      type: String,
      required: true,
      index: true,
    },
    paymentData: {
      type: mongoose.SchemaTypes.Mixed,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketType: {
      type: String,
      enum: ticketTypes,
      required: true,
    },
    img: {
      data: Buffer,
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentDataSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const PaymentData = mongoose.model('Payment Data', paymentDataSchema, 'payment data');

module.exports = PaymentData;
