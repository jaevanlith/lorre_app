const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../server/models/user.model');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const genders = ['male', 'female', 'other'];
const uni = [
  'Erasmus Universiteit Rotterdam',
  'Protestantse Theologische Universiteit',
  'Theologische Universiteit Apeldoorn',
  'Theologische Universiteit Kampen',
  'Radboud Universiteit Nijmegen',
  'Rijksuniversiteit Groningen',
  'Technische Universiteit Delft',
  'Technische Universiteit Eindhoven',
  'Universiteit Leiden',
  'Universiteit Maastricht',
  'Universiteit Twente',
  'Universiteit Utrecht',
  'Universiteit van Amsterdam',
  'Tilburg University',
  'Universiteit voor Humanistiek',
  'Vrije Universiteit Amsterdam',
  'Wageningen Universiteit',
  'Nyenrode Business Universiteit',
  'Hogeschool Avans',
  'Hogeschool Windesheim',
  'Hanzehogeschool',
  'NHL Stenden Hogeschool',
  'Fontys Hogeschool',
  'HAN',
  'Hogeschool Saxion',
  'Hogeschool Rotterdam',
  'Hogeschool Inholland',
  'Hogeschool van Amsterdam',
  'Haagse Hogeschool',
  'Hogeschool Leiden',
  'Hogeschool Utrecht',
  'Andere Hogeschool',
  'Anders',
];

const userOne = {
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.past().toISOString(),
  gender: faker.random.arrayElement(genders),
  university: faker.random.arrayElement(uni),
  city: faker.address.city(),
  email: faker.internet.email().toLowerCase(),
  isCheckedIn: faker.random.boolean(),
  password,
  role: 'user',
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  lastName: faker.name.lastName(),
  firstName: faker.name.firstName(),
  isCheckedIn: faker.random.boolean(),
  dateOfBirth: faker.date.past().toISOString(),
  gender: faker.random.arrayElement(genders),
  university: faker.random.arrayElement(uni),
  city: faker.address.city(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.findName(),
  lastName: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
};

const checkedInUser = {
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.past().toISOString(),
  gender: faker.random.arrayElement(genders),
  university: faker.random.arrayElement(uni),
  city: faker.address.city(),
  email: faker.internet.email().toLowerCase(),
  isCheckedIn: true,
  password,
  role: 'user',
};

const notCheckedInUser = {
  _id: mongoose.Types.ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.past().toISOString(),
  gender: faker.random.arrayElement(genders),
  university: faker.random.arrayElement(uni),
  city: faker.address.city(),
  email: faker.internet.email().toLowerCase(),
  isCheckedIn: false,
  password,
  role: 'user',
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  checkedInUser,
  notCheckedInUser,
  insertUsers,
  genders,
  uni,
};
