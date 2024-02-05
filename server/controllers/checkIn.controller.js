const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { checkInService } = require('../services');

const addCheckIn = catchAsync(async (req, res) => {
  const checkIn = await checkInService.addCheckIn(req.body);
  res.status(httpStatus.CREATED).send(checkIn);
});

const getCheckIns = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await checkInService.queryCheckIns(filter, options);
  res.send(result);
});

const deleteAllCheckInsForUser = catchAsync(async (req, res) => {
  await checkInService.deleteAllCheckInsForUser(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getHistory = catchAsync(async (req, res) => {
  const result = await checkInService.getHistory(req.params.userId);
  res.send(result);
});

const clearHistory = catchAsync(async (req, res) => {
  await checkInService.clearHistory(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  addCheckIn,
  getCheckIns,
  deleteAllCheckInsForUser,
  clearHistory,
  getHistory,
};
