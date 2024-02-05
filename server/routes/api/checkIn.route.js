const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const checkInValidation = require('../../validations/checkIn.validation');
const checkInController = require('../../controllers/checkIn.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(true, 'manageCheckIns'), validate(checkInValidation.addCheckIn), checkInController.addCheckIn)
  .get(auth(true, 'manageCheckIns'), validate(checkInValidation.getCheckIns), checkInController.getCheckIns);

router
  .route('/:userId')
  .delete(
    auth(true, 'manageCheckIns'),
    validate(checkInValidation.manageCheckInsForUser),
    checkInController.deleteAllCheckInsForUser
  );

router
  .route('/history/:userId')
  .get(auth(false, 'manageCheckIns'), validate(checkInValidation.manageCheckInsForUser), checkInController.getHistory);

router
  .route('/clearHistory/:userId')
  .get(auth(false, 'userOnly'), validate(checkInValidation.manageCheckInsForUser), checkInController.clearHistory);

module.exports = router;
