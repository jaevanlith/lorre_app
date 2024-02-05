import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Components/Menu';
import './stylesheets/Tools.css';

/**Class for admin to navigate to all tools */
class Tools extends Component {
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
          <Menu />

          <Link to="/Admin/CheckIn">
            <div className="tool-mobile-container">
              <span className="mobile-big-icon fa fa-check-circle" />
              <p className="tool-mobile-text">Check-in</p>
            </div>
          </Link>

          <Link to="/Admin/Catalog">
            <div className="tool-mobile-container">
              <span className="mobile-big-icon fa fa-database" />
              <p className="tool-mobile-text">Catalogus</p>
            </div>
          </Link>

          <Link to="/Admin/Analytics">
            <div className="tool-mobile-container bottom-tool-container">
              <span className="mobile-big-icon	fa fa-bar-chart" />
              <p className="tool-mobile-text">Statistieken</p>
            </div>
          </Link>
        </div>
      );
    } else {
      return (
        <div>
          <Menu />

          <div className="tools-container">
            <Link to="/Admin/CheckIn">
              <div className="tool-container">
                <span className="big-icon fa fa-check-circle fa-5x" />
                <p className="tool-text">Check-in</p>
              </div>
            </Link>

            <Link to="/Admin/Catalog">
              <div className="tool-container">
                <span className="big-icon fa fa-database fa-5x" />
                <p className="tool-text">Catalogus</p>
              </div>
            </Link>

            <Link to="/Admin/Analytics">
              <div className="tool-container">
                <span className="big-icon	fa fa-bar-chart fa-5x" />
                <p className="tool-text">Statistieken</p>
              </div>
            </Link>
          </div>
        </div>
      );
    }
  }
}

export default Tools;
