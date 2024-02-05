const { addDays, isSameDay } = require('date-fns');
const { CheckIn } = require('../models');

/**
 * Gets user data for check-ins in a specific time interval
 * @param queryFields Containing a startDate, endDate, and the requested fields
 * @returns {Promise<result>}
 */
const queryTimeInterval = async (queryFields) => {
  let fields = '';

  Object.entries(queryFields).forEach((entry) => {
    if (entry[1] === 1) {
      fields += `${entry[0]} `;
    }
  });

  const startDate = new Date(queryFields.startDate);
  let endDate = new Date(queryFields.endDate);
  if (isSameDay(startDate, endDate)) {
    endDate = addDays(endDate, 1);
  }

  const checkIns = await CheckIn.find({ date: { $gte: startDate, $lte: endDate } })
    .populate('userId', fields)
    .select('date userId')
    .sort({ date: 1 });

  return checkIns;
};

/**
 * Gets user data for all-time check-ins
 * @param queryFields The requested fields
 * @returns {Promise<result>}
 */
const queryAllTime = async (queryFields) => {
  let fields = '';

  Object.entries(queryFields).forEach((entry) => {
    if (entry[1] === 1) {
      fields += `${entry[0]} `;
    }
  });

  const checkIns = await CheckIn.find().populate('userId', fields).select('date userId').sort({ date: 1 });

  return checkIns;
};

module.exports = {
  queryTimeInterval,
  queryAllTime,
};
