const catchAsync = require('../utils/catchAsync');
const { analyticsService } = require('../services');

const queryTimeInterval = catchAsync(async (req, res) => {
  const results = await analyticsService.queryTimeInterval(req.query);
  res.send(results);
});

const queryAllTime = catchAsync(async (req, res) => {
  const results = await analyticsService.queryAllTime(req.query);
  res.send(results);
});

module.exports = {
  queryTimeInterval,
  queryAllTime,
};
