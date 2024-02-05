const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    university: {
      type: String,
      enum: [
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
      ],
    },
    city: {
      type: String,
      trim: true,
      minlength: 2,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
