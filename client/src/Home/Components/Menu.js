import React, { Component } from 'react';
import LiveCount from '../../Components/LiveCount';
import api from '../../utils/API';
import '../stylesheets/Components/Menu.css';

/** Menu bar for homepage **/
class Menu extends Component {
  state = {
    status: '',
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
  }

  render() {
    return (
      <div>
        {!this.state.err && (
          <div className="menu-status-box">
            <p className="we-zijn">We zijn</p>
            {this.state.status === 'closed' && <p className="menu-status">gesloten</p>}
            {this.state.status === 'open' && <p className="menu-status">open</p>}
          </div>
        )}

        {this.state.err && (
          <div>
            <p className="menu-status-err">Er is iets misgegaan</p>
          </div>
        )}

        <LiveCount />
      </div>
    );
  }
}

export default Menu;
