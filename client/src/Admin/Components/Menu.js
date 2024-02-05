import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import '../stylesheets/Components/Menu.css';

/** Menu bar for admin **/
class Menu extends Component {
  state = {
    winWidth: window.innerWidth,
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  /**
   * This method keeps track of the window size to distinguish desktop and mobile users.
   */
  handleWindowSizeChange = () => {
    this.setState({ winWidth: window.innerWidth });
  };

  render() {
    const isMobile = this.state.winWidth <= 600;

    if (isMobile) {
      return (
        <div>
          <span className="menu-mobile-logout-icon fa fa-sign-out fa-2x" onClick={AuthService.logout} />
          <Link to="/Admin/Tools">
            <span className="menu-mobile-tool-icon fa fa-wrench" />
          </Link>

          <img className="menu-logo" src="https://i.ibb.co/pnybxxn/Logo-Rond-transp-background-gradient.png" alt="Lorre" />
          <span className="menu-admin">ADMIN</span>
        </div>
      );
    } else {
      return (
        <div>
          <span className="menu-logout-icon fa fa-sign-out fa-2x" onClick={AuthService.logout} />
          <Link to="/Admin/Tools">
            <span className="menu-tool-icon fa fa-wrench fa-2x" />
          </Link>

          <img className="menu-logo" src="https://i.ibb.co/pnybxxn/Logo-Rond-transp-background-gradient.png" alt="Lorre" />
          <span className="menu-admin">Administrator</span>
        </div>
      );
    }
  }
}

export default Menu;
