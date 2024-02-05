import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Pass from './Components/Pass';
import api from './../utils/API';
import Menu from './Components/Menu';
import './stylesheets/Overview.css';

/** Class for user to see an overview of their passes */
class Overview extends Component {
  state = {
    userId: localStorage.getItem('userId'),
    firstName: '',
    lastName: '',
    tickets: [],
    err: false,
  };

  /**
   * This method retrieves the user's name and tickets.
   */
  componentDidMount() {
    api
      .get('/users/' + this.state.userId)
      .then((res) => {
        this.setState({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        });
      })
      .catch(() => {
        this.setState({
          err: true,
        });
      });

    api
      .get('/tickets/get/' + this.state.userId)
      .then((res) => {
        this.setState({
          tickets: res.data,
        });
      })
      .catch(() => {
        this.setState({
          err: true,
        });
      });
  }

  render() {
    /**
     * This method maps tickets into the pass component or returns no passes message.
     * @returns {Pass}
     */
    const passes = () => {
      if (this.state.tickets.length) {
        return this.state.tickets.map((ticket) => (
          <Pass
            key={ticket.id}
            passId={ticket.id}
            firstName={this.state.firstName}
            lastName={this.state.lastName}
            type={ticket.type}
            endDate={ticket.endDate}
            image={ticket.img}
          />
        ));
      } else {
        return (
          <div className="overview-message-container">
            <p className="overview-message" data-testid="no-passes">
              Je hebt nog geen passen...
            </p>
            <Link to={'/User/BuyPass'}>
              <button className="middle">Pas Kopen</button>
            </Link>
          </div>
        );
      }
    };

    return (
      <div className="mobile-width">
        <Menu currentPage={'overview'} />
        <div>
          <Link to={'/User/BuyPass'}>
            <button className="buy-pass-btn btn-grad-border">Pas Kopen</button>
          </Link>

          {!this.state.err && passes()}

          {this.state.err && (
            <div className="error">
              <span className="fa fa-exclamation-triangle triangle" />
              <p className="error-text" data-testid="err-message">
                Passen ophalen mislukt
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Overview;
