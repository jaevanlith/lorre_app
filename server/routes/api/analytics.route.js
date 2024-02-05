const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const analyticsValidation = require('../../validations/analytics.validation');
const analyticsController = require('../../controllers/analytics.controller');

const router = express.Router();

router
  .route('/queryTimeInterval')
  .get(auth(true, 'analytics'), validate(analyticsValidation.queryTimeInterval), analyticsController.queryTimeInterval);

router
  .route('/queryAllTime')
  .get(auth(true, 'analytics'), validate(analyticsValidation.queryAllTime), analyticsController.queryAllTime);

module.exports = router;
