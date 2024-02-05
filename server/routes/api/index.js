const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const ticketRoute = require('./ticket.route');
const checkInRoute = require('./checkIn.route');
const analyticsRoute = require('./analytics.route');
const paymentRoute = require('./payment.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/tickets', ticketRoute);
router.use('/checkIns', checkInRoute);
router.use('/analytics', analyticsRoute);
router.use('/payments', paymentRoute);

module.exports = router;
