import React, { Component } from 'react';
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import API from '../utils/API';

/** Payment page using Adyen Web Drop-In */
class CheckOut extends Component {
  state = {
    userId: localStorage.getItem('userId'),
    ticketType: localStorage.getItem('cartTicketType'),
    img: localStorage.getItem('cartImage'),
  };
  /**
   * Makes a post request to the given url with the given data
   * @param url
   * @param data
   * @returns {Promise<AxiosResponse<any>>}
   */
  async callServer(url, data) {
    const res = await API.post(url, data);
    return res;
  }

  /**
   * Handles the response of the server
   * First checks for action, which will be handled by drop-in, if no action then the payment has completed and we redirect the user
   * @param res
   * @param component
   */
  handleServerResponse(res, component) {
    console.log(res);
    if (res.action) {
      console.log(res.action);
      component.handleAction(res.action);
    }
  }

  /**
   * Calls the server at the provided endpoint and passes the payment data
   * @param data
   * @param component
   * @param url
   * @returns {Promise<void>}
   */
  async handleSubmission(data, component, url) {
    try {
      const res = await this.callServer(url, data);
      this.handleServerResponse(res.data, component);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Configures the drop-in box
   * It retrieves the payment methods and client key and then configures the payment box based on this
   * @returns {Promise<void>}
   */
  async initCheckout() {
    try {
      const getPaymentMethodsResponse = await this.callServer('/payments/paymentMethods');
      const paymentMethodsResponse = getPaymentMethodsResponse.data.paymentsResponse;
      const clientKey = getPaymentMethodsResponse.data.clientKey;

      const configuration = {
        paymentMethodsResponse,
        clientKey,
        locale: 'nl-NL',
        environment: 'test', // set to live when in production
        showPayButton: true,
        onSubmit: (state, component) => {
          if (state.isValid) {
            const paymentMethod = state.data.paymentMethod;
            const ticketType = this.state.ticketType;
            const userId = this.state.userId;
            const img = this.state.img;
            this.handleSubmission({ paymentMethod, ticketType, userId, img }, component, '/payments/makePayment');
          }
        },
        onAdditionalDetails: (state, component) => {
          console.log('payment methods that require additional details not supported');
          // this.handleSubmission(state, component, "/api/submitAdditionalDetails");
        },
      };
      const checkout = new AdyenCheckout(configuration);
      checkout.create('dropin').mount(document.getElementById('dropin-container'));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * This is method is called when the component is mounted.
   */
  componentDidMount() {
    this.initCheckout();
  }

  render() {
    return <div id="dropin-container" />;
  }
}

export default CheckOut;
