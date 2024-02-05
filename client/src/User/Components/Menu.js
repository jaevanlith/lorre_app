import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import LiveCount from './../../Components/LiveCount';
import '../stylesheets/Components/Menu.css';

/** Menu bar for user **/
class Menu extends Component {
  constructor(props) {
    super(props);
    let cogClass = '';
    let ticketClass = '';

    if (props.currentPage === 'overview') ticketClass = 'current-page';
    if (props.currentPage === 'accountDetails') cogClass = 'current-page';

    this.state = {
      cogClass,
      ticketClass,
    };
  }

  render() {
    return (
      <div className="mobile-width user-menu-container">
        <span className="user-menu-icon fa fa-sign-out" onClick={AuthService.logout} />
        <Link to="/User/AccountDetails">
          <span className={'user-menu-icon fa fa-cog ' + this.state.cogClass} />
        </Link>
        <Link to="/User/Overview">
          <span className={'user-menu-icon fa fa-ticket ' + this.state.ticketClass} />
        </Link>

        <LiveCount />
      </div>
    );
  }
}

export default Menu;
