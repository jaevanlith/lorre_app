const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const checkInSchema = mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // Keeps track of whether the user has cleared this check-in in their history
  inHistory: {
    type: Boolean,
    default: true,
  },
});

// add plugin that converts mongoose to json
checkInSchema.plugin(toJSON);
checkInSchema.plugin(paginate);

/**
 * @typedef CheckIn
 */
const CheckIn = mongoose.model('Check-in', checkInSchema);

module.exports = CheckIn;
