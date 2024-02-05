const Joi = require('joi');

/**
 * Specifies the query schema to request analytics for a time interval
 * Provide startDate and endDate in YYYY-MM-dd format
 * Other fields: 1 if requested, 0 or leave out if not.
 * example url: localhost:5000/api/analytics/queryTimeInterval?startDate=2020-12-17&endDate=2020-12-20&city=1&gender=1&dateOfBirth=1&university=1
 * @type {{query: Joi.ObjectSchema<any>}}
 */
const queryTimeInterval = {
  query: Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    dateOfBirth: Joi.number().valid(0, 1),
    gender: Joi.number().valid(0, 1),
    university: Joi.number().valid(0, 1),
    city: Joi.number().valid(0, 1),
  }),
};

/**
 * Specifies the query schema to request analytics
 * Fields: 1 if requested, 0 or leave out if not.
 * example url: localhost:5000/api/analytics/queryAllTime?city=1&gender=1&dateOfBirth=1&university=1
 * @type {{query: Joi.ObjectSchema<any>}}
 */
const queryAllTime = {
  query: Joi.object().keys({
    dateOfBirth: Joi.number().valid(0, 1),
    gender: Joi.number().valid(0, 1),
    university: Joi.number().valid(0, 1),
    city: Joi.number().valid(0, 1),
  }),
};

module.exports = {
  queryTimeInterval,
  queryAllTime,
};
