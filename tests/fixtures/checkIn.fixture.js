const mongoose = require('mongoose');
const faker = require('faker');
const CheckIn = require('../../server/models/checkIn.model');
const { userOne, userTwo } = require('./user.fixture');

const checkInOne = {
  _id: mongoose.Types.ObjectId(),
  userId: mongoose.Types.ObjectId(),
  date: faker.date.past().toISOString(),
  inHistory: faker.random.boolean(),
};

const checkInTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: mongoose.Types.ObjectId(),
  date: faker.date.past().toISOString(),
  inHistory: faker.random.boolean(),
};

const dbCheckInOne = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  date: faker.date.past().toISOString(),
  inHistory: true,
};

const dbCheckInTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  date: faker.date.past().toISOString(),
  inHistory: false,
};

const dbCheckInThree = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  date: faker.date.past().toISOString(),
  inHistory: true,
};

const analyticsCheckInOne = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  date: new Date('2020-12-17').toISOString(),
};

const analyticsCheckInTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: userTwo._id,
  date: new Date('2020-12-20').toISOString(),
};

const analyticsCheckInThree = {
  _id: mongoose.Types.ObjectId(),
  userId: userOne._id,
  date: new Date('2020-12-25').toISOString(),
};

const insertCheckIns = async (checkIns) => {
  await CheckIn.insertMany(checkIns.map((checkIn) => ({ ...checkIn })));
};

module.exports = {
  checkInOne,
  checkInTwo,
  dbCheckInOne,
  dbCheckInTwo,
  dbCheckInThree,
  analyticsCheckInOne,
  analyticsCheckInTwo,
  analyticsCheckInThree,
  insertCheckIns,
};
