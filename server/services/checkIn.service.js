const httpStatus = require('http-status');
const { CheckIn } = require('../models');
const { userService } = require('.');
const ApiError = require('../utils/ApiError');

/**
 * Add a check-in
 * @param {Object} checkInBody
 * @returns {Promise<CheckIn>}
 */
const addCheckIn = async (checkInBody) => {
  const user = await userService.getUserById(checkInBody.userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User doesnt exist');
  }
  let date;
  if (!checkInBody.date) {
    date = Date.now();
  } else date = checkInBody.date;

  const checkIn = await CheckIn.create({ userId: checkInBody.userId, date });
  return checkIn;
};

/**
 * Checks in a user with a given ticket
 * @param user
 * @param ticket
 * @returns {Promise<CheckIn>}
 */
const checkInUser = async (user, ticket) => {
  // Change user's check-in status
  Object.assign(user, { isCheckedIn: true });
  await user.save();

  // One-time tickets are invalid after first use
  if (ticket.type === 'one-time') {
    Object.assign(ticket, { endDate: Date.now() });
    await ticket.save();
  }

  // Store check-in
  const checkIn = await addCheckIn({ userId: ticket.userId });
  return checkIn;
};

/**
 * Query for check-ins
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCheckIns = async (filter, options) => {
  const checkIns = await CheckIn.paginate(filter, options);
  return checkIns;
};

/**
 * Permanently delete all stored check-ins for a given user
 * @param {ObjectId} userId
 * @returns {Promise<result>}
 */
const deleteAllCheckInsForUser = async (userId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User doesnt exist');
  }
  const result = await CheckIn.deleteMany({ userId });
  return result;
};

/**
 * Gets the check-in history for a given user
 * @param userId
 * @returns {Promise<result>}
 */
const getHistory = async (userId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User doesnt exist');
  }
  const result = await CheckIn.find({ userId, inHistory: true }, 'date').sort({ date: -1 });
  return result;
};

/**
 * Updates inHistory for all check-ins for a given user when the user clears their check-in history
 * This ensures that the old check-ins won't show up in the user's history anymore on further history requests
 * This does *not* delete the check-ins from the db, to ensure they can still be used for analytics
 * @param userId
 * @returns {Promise<result>}
 */
const clearHistory = async (userId) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User doesnt exist');
  }
  const result = await CheckIn.updateMany({ userId, inHistory: true }, { inHistory: false });
  return result;
};

module.exports = {
  addCheckIn,
  checkInUser,
  queryCheckIns,
  deleteAllCheckInsForUser,
  getHistory,
  clearHistory,
};
