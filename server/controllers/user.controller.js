const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'firstName',
    'lastName',
    'email',
    'role',
    'gender',
    'city',
    'dateOfBirth',
    'isCheckedIn',
    'university',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const inclusiveSearch = catchAsync(async (req, res) => {
  const result = await userService.queryInclusive(req.query.keyword);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const changePassword = catchAsync(async (req, res) => {
  await userService.changePassword(req.params.userId, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCheckedInCount = catchAsync(async (req, res) => {
  const currentCount = await userService.getCheckedInCount();
  res.send(currentCount.toString());
});

const getCheckedInCountMinus = catchAsync(async (req, res) => {
  const currentCount = await userService.getCheckedInCountMinus();
  res.send(currentCount.toString());
});

const getCheckedInCountPlus = catchAsync(async (req, res) => {
  const currentCount = await userService.getCheckedInCountPlus();
  res.send(currentCount.toString());
});

const checkOutAllUsers = catchAsync(async (req, res) => {
  const currentCount = await userService.checkOutAllUsers();
  res.send(currentCount);
});

const changeStatus = catchAsync(async (req, res) => {
  const status = userService.changeStatus();
  res.send(status);
});

const getStatus = catchAsync(async (req, res) => {
  const status = userService.getStatus();
  res.send(status);
});

module.exports = {
  createUser,
  getUsers,
  inclusiveSearch,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
  getCheckedInCount,
  getCheckedInCountMinus,
  getCheckedInCountPlus,
  checkOutAllUsers,
  changeStatus,
  getStatus,
};
