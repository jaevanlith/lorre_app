const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(true, 'manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth(true, 'getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth(false, 'getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth(false, 'manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(false, 'manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/search/inclusive')
  .get(auth(true, 'getUsers'), validate(userValidation.inclusiveSearch), userController.inclusiveSearch);

router
  .route('/changePassword/:userId')
  .patch(auth(false, 'manageUsers'), validate(userValidation.changePassword), userController.changePassword);

router
  .route('/updateRole/:userId')
  .patch(auth(true, 'manageUsers'), validate(userValidation.updateRole), userController.updateUser);
router
  .route('/updateCheckIn/:userId')
  .patch(auth(true, 'manageUsers'), validate(userValidation.updateCheckIn), userController.updateUser);

router.route('/currentCheckIns/total').get(userController.getCheckedInCount);
router.route('/currentCheckIns/plus').get(auth(true, 'getUsers'), userController.getCheckedInCountPlus);
router.route('/currentCheckIns/minus').get(auth(true, 'getUsers'), userController.getCheckedInCountMinus);

router.route('/checkOutAll').post(auth(true, 'manageUsers'), userController.checkOutAllUsers);
router.route('/changeStatus').post(auth(true, 'manageUsers'), userController.changeStatus);
router.route('/lorre/getStatus').get(userController.getStatus);

module.exports = router;
