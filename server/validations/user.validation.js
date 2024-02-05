const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other'),
    university: Joi.string(),
    city: Joi.string(),
    dateOfBirth: Joi.date(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    email: Joi.string().email(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    gender: Joi.string().valid('male', 'female', 'other'),
    university: Joi.string(),
    city: Joi.string(),
    dateOfBirth: Joi.date(),
    isCheckedIn: Joi.boolean(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      firstName: Joi.string(),
      lastName: Joi.string(),
      gender: Joi.string().valid('male', 'female', 'other'),
      university: Joi.string(),
      city: Joi.string(),
      dateOfBirth: Joi.date(),
    })
    .min(1),
};

const changePassword = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      oldPassword: Joi.string().custom(password),
      newPassword: Joi.string().custom(password),
    })
    .min(2),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

// GET api/users/search/inclusive?keyword={search string}
const inclusiveSearch = {
  query: Joi.object().keys({
    keyword: Joi.string().required(),
  }),
};

const updateRole = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const updateCheckIn = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    isCheckedIn: Joi.boolean().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
  inclusiveSearch,
  updateRole,
  updateCheckIn,
};
