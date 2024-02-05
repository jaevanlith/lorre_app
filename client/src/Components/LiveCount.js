import React, { Component } from 'react';
import api from '../utils/API';
import './stylesheets/LiveCount.css';

/** Class for displaying the live count */
class LiveCount extends Component {
  state = {
    status: '',
    count: 0,
    max: 500,
    err: false,
  };

  componentDidMount() {
    api
      .get('users/lorre/getStatus')
      .then((result) => {
        this.setState({ status: result.data });
      })
      .catch(() => {
        this.setState({ err: true });
      });
    api
      .get(`/users/currentCheckIns/total`)
      .then((res) => {
        this.setState({ count: res.data });
      })
      .catch((err) => {
        this.setState({ err: true });
      });
  }

  render() {
    return (
      <div data-testid="screen">
        {/* Display the count with progressbar when open and no error */}
        {this.state.status === 'open' && !this.state.err && (
          <div className="count-container">
            <p className="visitors">bezoekers</p>
            <p className="count" data-testid="num-visitors">
              {this.state.count}
            </p>
            <div className="progress-container">
              <progress className="progress-bar" value={this.state.count} max={this.state.max} />
            </div>
          </div>
        )}

        {/* Display text when closed */}
        {this.state.status === 'closed' && !this.state.err && (
          <div className="count-container">
            <img
              data-testid="logo"
              className="logo"
              src="https://i.ibb.co/pnybxxn/Logo-Rond-transp-background-gradient.png"
              alt="Lorre"
            />
          </div>
        )}

        {/* Display on error */}
        {this.state.err && <h4 data-testid="err-message">Er is iets misgegaan</h4>}
      </div>
    );
  }
}

export default LiveCount;
