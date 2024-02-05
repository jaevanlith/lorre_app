const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');

const getPaymentMethods = catchAsync(async (req, res) => {
  const paymentMethodsResponse = await paymentService.getPaymentMethods(req.body);
  res.send(paymentMethodsResponse);
});

const makePayment = catchAsync(async (req, res) => {
  const paymentResponse = await paymentService.makePayment(req.body);
  res.send(paymentResponse);
});

const handleShopperRedirect = catchAsync(async (req, res) => {
  const paymentResponse = await paymentService.handleShopperRedirect(req);
  // links to the front-end pages
  switch (paymentResponse.resultCode) {
    case 'Authorised':
      res.redirect('http://localhost:3000/PaymentResult/Success');
      break;
    case 'Pending':
    case 'Received':
      res.redirect('http://localhost:3000/PaymentResult/Pending');
      break;
    case 'Cancelled':
      res.redirect('http://localhost:3000/PaymentResult/Cancelled');
      break;
    case 'Refused':
      res.redirect('http://localhost:3000/PaymentResult/Failed');
      break;
    default:
      res.redirect('http://localhost:3000/PaymentResult/Error');
      break;
  }
});

module.exports = { getPaymentMethods, makePayment, handleShopperRedirect };
