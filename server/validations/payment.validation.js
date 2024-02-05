const Joi = require('joi');
const { objectId } = require('./custom.validation');

// amount is not required, but needs to be correct if it is specified
const getPaymentMethods = {
  body: Joi.object().keys({
    amount: Joi.object().keys({ currency: Joi.string().required(), value: Joi.number().required() }),
  }),
};

const makePayment = {
  body: Joi.object().keys({
    paymentMethod: Joi.object().required(),
    ticketType: Joi.string().required().valid('year', 'one-time'),
    userId: Joi.string().required().custom(objectId),
    img: Joi.binary().required(),
  }),
};

module.exports = { getPaymentMethods, makePayment };
