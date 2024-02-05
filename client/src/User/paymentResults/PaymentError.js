import React, { Component } from 'react';

/**
 * Redirect screen after an error during payment
 */
class PaymentError extends Component {
  /**
   * Handles going back to their own overview page
   */
  handleViewPass = () => {
    window.location.replace('/User/Overview');
  };

  /**
   * Handles the user wanting to try again
   */
  handleTryAgain = () => {
    window.location.replace('/User/BuyPass');
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
          <h4>Oeps, er is iets misgegaan.</h4>
          <h4>Probeer het opnieuw!</h4>
          <button data-testid="again" onClick={this.handleTryAgain}>
            Probeer opnieuw
          </button>
          <h4>Niet nog een keer proberen? Terug naar je overzicht</h4>
          <button data-testid="viewPassFail" onClick={this.handleViewPass}>
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }
}

export default PaymentError;
