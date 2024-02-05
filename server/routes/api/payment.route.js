const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const paymentValidation = require('../../validations/payment.validation');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router
  .route('/paymentMethods')
  .post(auth(true, 'makePayments'), validate(paymentValidation.getPaymentMethods), paymentController.getPaymentMethods);

router
  .route('/makePayment')
  .post(auth(true, 'makePayments'), validate(paymentValidation.makePayment), paymentController.makePayment);

router.route('/handleShopperRedirect').all(paymentController.handleShopperRedirect);

module.exports = router;
