const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addCheckIn = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    date: Joi.date(),
  }),
};

const getCheckIns = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const manageCheckInsForUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  addCheckIn,
  getCheckIns,
  manageCheckInsForUser,
};
