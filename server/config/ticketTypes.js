const ticketTypes = ['year', 'one-time'];

const ticketPrices = new Map();

// Adyen uses minor units: The smallest unit of a currency, depending on the number of decimals.
ticketPrices.set(ticketTypes[0], { currency: 'EUR', value: 850 }); // == €8,50
ticketPrices.set(ticketTypes[1], { currency: 'EUR', value: 200 }); // == €2,00

module.exports = {
  ticketTypes,
  ticketPrices,
};
