const httpStatus = require('http-status');
const { Client, Config, CheckoutAPI } = require('@adyen/api-library');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const globalConfig = require('../config/config');
const { PaymentData } = require('../models');
const { ticketPrices } = require('../config/ticketTypes');
const ticketService = require('./ticket.service');
const emailService = require('./email.service');

// set up client that communicates with Adyen API
const config = new Config();
config.apiKey = globalConfig.adyen.apiKey;
config.merchantAccount = globalConfig.adyen.merchantAccount;
const client = new Client({ config });

if (globalConfig.env === 'production') {
  client.setEnvironment('LIVE'); // LIVE when in production, also need to pass live endpoint url!
} else client.setEnvironment('TEST'); // TEST when in development or test
const checkout = new CheckoutAPI(client);

/**
 * Gets the available payment methods (based on shopper's country, device, and the payment amount)
 * @param shopperBody Specifies payment amount
 * @returns {Promise<{clientKey: *, paymentsResponse: ICheckout.PaymentMethodsResponse}>}
 */
const getPaymentMethods = async (shopperBody) => {
  const paymentsResponse = await checkout.paymentMethods({
    merchantAccount: config.merchantAccount,
    allowedPaymentMethods: ['ideal'], // only ideal
    // Set to NL, others aren't relevant
    countryCode: 'NL',
    shopperLocale: 'nl-NL',
    amount: shopperBody.amount, // format: { currency: 'EUR', value: 1000 }, not required (can be empty)
    channel: 'Web',
  });
  return { clientKey: globalConfig.adyen.clientKey, paymentsResponse };
};

/**
 * Makes a payment with the payment details given in the payment body
 * @param paymentBody Contains payment method and amount to be paid
 * @returns {Promise<ICheckout.PaymentResponse>}
 */
const makePayment = async (paymentBody) => {
  const orderRef = uuidv4();
  const { paymentMethod, userId, ticketType, img } = paymentBody;
  const amount = ticketPrices.get(ticketType);

  const paymentResponse = await checkout.payments({
    merchantAccount: config.merchantAccount,
    paymentMethod, // state.data.paymentMethod from the front-end after onSubmit event
    amount, // inferred from ticket type
    reference: orderRef, // order number
    // we pass the orderRef in return URL to get paymentData during redirects
    returnUrl: `http://localhost:5000/api/payments/handleShopperRedirect?orderRef=${orderRef}`, // URL to where the shopper is taken back to after a redirection
  });

  const { action } = paymentResponse;

  if (action) {
    await PaymentData.create({
      orderRef,
      paymentData: action.paymentData,
      userId,
      ticketType,
      img,
    });
  }
  return paymentResponse;
};

/**
 * Handles the request to the return URL where the shopper is taken to after a redirection (eg. when the shopper has to pay on their bank's website)
 * @param req The request from the redirected page
 * @returns {Promise<ICheckout.PaymentResponse>}
 */
const handleShopperRedirect = async (req) => {
  // Create the payload for submitting payment details
  const { orderRef } = req.query;
  const redirect = req.method === 'GET' ? req.query : req.body;
  const details = {};

  if (redirect.payload) {
    details.payload = redirect.payload;
  } else if (redirect.redirectResult) {
    details.redirectResult = redirect.redirectResult;
  } else {
    details.MD = redirect.MD;
    details.PaRes = redirect.PaRes;
  }

  const { paymentData, userId, ticketType, img } = await PaymentData.findOne({ orderRef });
  if (!paymentData || !userId || !ticketType || !img) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment details not found or incomplete');
  }

  const payload = {
    details,
    paymentData,
  };

  const paymentResult = await checkout.paymentsDetails(payload);

  switch (paymentResult.resultCode) {
    case 'Authorised': // The payment was successful
      await ticketService.createTicket({ userId, type: ticketType, img }); // store bought ticket
      await PaymentData.deleteOne({ orderRef }); // delete payment data after storage
      await emailService.confirmPurchaseEmail(userId, ticketType);
      break;
    case 'Cancelled': // The shopper cancelled the payment while on their bank's website.
      await PaymentData.deleteOne({ orderRef }); // don't need data anymore, user needs to try again manually
      break;
    case 'Refused': // The payment was refused by the shopper's bank.
      await PaymentData.deleteOne({ orderRef }); // don't need data anymore, user needs to try again manually
      break;
    default:
      break;
  }

  return paymentResult; // { "resultCode": Outcome of the payment, "pspReference": Adyen unique identifier for the transaction }
};

module.exports = { getPaymentMethods, makePayment, handleShopperRedirect };
