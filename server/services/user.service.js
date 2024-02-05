const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

// value will only be changed if Lorre decides to upgrade its capacities
// hardcoded as to prevent accidental changes and in turn blocking checkins
const maxVisitors = 500;
let adminManipulatedCount = 0;
let status = 'closed';

/**
 * Change status to 'open' if closed to 'closed' if open
 * @returns {status}
 */
const changeStatus = () => {
  if (status === 'closed') status = 'open';
  else status = 'closed';

  return status;
};

/**
 * Get status. Either 'open' or 'closed'
 * @returns {status}
 */
const getStatus = () => {
  return status;
};

/**
 * Get user checkin count
 * @returns {count}
 */
const getCheckedInCount = async () => {
  const total = await User.count({ isCheckedIn: true });
  return total + adminManipulatedCount;
};

/**
 * Get user checkin count plus admin manipulation as long as it is less than maxVisitors
 * @returns {count}
 */
const getCheckedInCountPlus = async () => {
  const total = await User.count({ isCheckedIn: true });
  if (adminManipulatedCount < maxVisitors - 1) {
    adminManipulatedCount += 1;
  }
  return total + adminManipulatedCount;
};

/**
 * Get user checkin count minus admin manipulation
 * @returns {count}
 */
const getCheckedInCountMinus = async () => {
  const total = await User.count({ isCheckedIn: true });
  if (adminManipulatedCount > -total) adminManipulatedCount -= 1;
  return total + adminManipulatedCount;
};

/**
 * Checkout all users
 * @returns {count} count of all users
 */
const checkOutAllUsers = async () => {
  adminManipulatedCount = 0;
  return User.updateMany({ isCheckedIn: false });
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Finds all users containing the (case-insensitive) keyword in any of firstName, lastName (or their concatenation) or email
 * @param keyword
 * @returns {Promise<QueryResult>}
 */
const queryInclusive = async (keyword) => {
  const users = await User.find().or([
    { email: { $regex: keyword, $options: 'i' } },
    {
      $expr: {
        $regexMatch: {
          input: { $concat: ['$firstName', ' ', '$lastName'] },
          regex: keyword,
          options: 'i',
        },
      },
    },
  ]);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Changes the password for the given user
 * @param userId
 * @param passwordBody
 * @returns {Promise}
 */
const changePassword = async (userId, passwordBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const oldPasswordMatch = await user.isPasswordMatch(passwordBody.oldPassword);
  if (!oldPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }
  user.password = passwordBody.newPassword;
  await user.save();
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  queryInclusive,
  getUserById,
  getUserByEmail,
  updateUserById,
  changePassword,
  deleteUserById,
  getCheckedInCount,
  getCheckedInCountPlus,
  getCheckedInCountMinus,
  checkOutAllUsers,
  changeStatus,
  getStatus,
};
