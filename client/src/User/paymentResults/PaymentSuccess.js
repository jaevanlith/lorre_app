import React, { Component } from 'react';

/**
 * Redirect screen after a successful payment
 */
class PaymentSuccess extends Component {
  /**
   * Handles going back to their own overview page
   */
  handleViewPass = () => {
    window.location.replace('/User/Overview');
  };

  /**
   * Clear ticket details related to the buy process from local storage
   */
  componentDidMount() {
    localStorage.removeItem('cartTicketType');
    localStorage.removeItem('cartImage');
  }

  render() {
    return (
      <div data-testid="screen">
        <div>
          <h4>Bedankt, je betaling is gelukt!</h4>
          <h4>U kunt hier uw nieuwe pas bekijken:</h4>
          <button data-testid="viewPassSuccess" onClick={this.handleViewPass}>
            Bekijk passen
          </button>
        </div>
      </div>
    );
  }
}

export default PaymentSuccess;
