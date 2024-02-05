import React, { Component } from 'react';

/**
 * Redirect screen after payment completion but not yet confirmed by iDEAL
 */
class PaymentPending extends Component {
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
          <h4>Bedankt, we zijn je betaling aan het verwerken.</h4>
          <h4>U kunt alvast hier uw nieuwe pas bekijken:</h4>
          <button data-testid="viewPassSuccess" onClick={this.handleViewPass}>
            Bekijk passen
          </button>
        </div>
      </div>
    );
  }
}

export default PaymentPending;
