import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Components/Menu';
import AuthService from '../services/AuthService';
import './stylesheets/Login.css';

/**Class for Login.
 * This class renders the login screen.
 * Via this screen you can also reset your password
 */
class Login extends Component {
  state = {
    login: [
      { id: 1, value: '' },
      { id: 2, value: '' },
    ],
    errMessage: '',
  };

  /**
   * This method handles changes to the input fields of the form below.
   * @param {*} e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    let login = [...this.state.login];
    const index = e.target.id - 1;
    let item = { ...login[index] };
    item.value = e.target.value;
    login[index] = item;
    this.setState({ login });
  };

  /**
   * This method changes the type of the password input fields to text and back to password.
   * It helps the user see what they have typed in the fields.
   */
  handleVisibility = () => {
    var x = document.getElementById('2');
    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }
  };
  /**
   * This method is called when the form is submitted. It sends the user to the overview page.
   */
  handleSubmit = (e) => {
    e.preventDefault();

    const email = this.state.login[0].value;
    const password = this.state.login[1].value;

    AuthService.login(email, password)
      .then((res) => {
        if (res.user) {
          const role = res.user.role;
          if (role === 'user') {
            window.location.replace('/User/Overview');
          } else if (role === 'admin') {
            window.location.replace('/Admin/Tools');
          }
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 401) {
            this.setState({ errMessage: 'E-mail en/of wachtwoord incorrect' });
          } else {
            this.setState({ errMessage: 'Er is iets misgegaan' });
          }
        } else {
          this.setState({ errMessage: 'Er is iets misgegaan' });
        }
      });
  };

  render() {
    return (
      <div>
        <Menu />
        {this.state.errMessage && (
          <div className="error-login" data-testid="fail-message">
            <span className="fa fa-exclamation-triangle triangle-login" />
            <p className="error-text-login">{this.state.errMessage}</p>
          </div>
        )}
        <form style={{ marginTop: '10px' }} onSubmit={(e) => this.handleSubmit(e)}>
          <div className="field-container middle">
            <span className="fa fa-envelope-o field-icon" />
            <input
              className="login-input middle"
              placeholder="Email"
              type="email"
              id="1"
              required="required"
              onChange={this.handleChange}
            />
          </div>
          <div className="field-container middle">
            <span className="fa fa-fw fa-lock fa-lg password-field-icon" />
            <input
              className="login-input password-field"
              placeholder="Wachtwoord"
              type="password"
              id="2"
              required="required"
              data-testid="password"
              onChange={this.handleChange}
            />
            <span onClick={this.handleVisibility} data-testid="visibility" className="fa fa-fw fa-eye eye-icon" />
          </div>
          <button className="middle login-btn" data-testid="login-button" type="submit">
            Inloggen
          </button>
        </form>
        <p className="text">
          <Link to="/Register">
            <button className="btn-grad-border middle">Registreren</button>
          </Link>
        </p>
        <p className="text">
          Wachtwoord vergeten? <Link to="/ResetPassword">Herstel</Link>
        </p>
        <div className="dropup">
          <i data-testid="dropup" className="dropbtn fa fa-info-circle fa-2x"></i>
          <div className="dropup-content" data-testid="info">
            <p>Informatie</p>
            <p>Openingstijden: Dinsdag: 23.00-04.00 Donderdag: 23.00-05.00 Deuren sluiten om 2:00</p>
            <p>Adres: Studentendiscotheek Lorre Phoenixstraat 30 2611 AL, Delft Nederland</p>
            <p>email: info@lorre.nl telefoon: 015 – 2150027</p>
            <p>Voor de huisregels en meer:</p>
            <a href="http://lorre.nl/info">Onze webstite</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
