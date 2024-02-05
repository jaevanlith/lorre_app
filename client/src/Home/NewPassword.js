import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Components/Menu';
import { passwordIsValid, translateErrors } from '../services/Functions';
import API from '../utils/API';
import './stylesheets/NewPassword.css';
/**This is a form to reset your password when you have forgotten it.
 * You can get to this form via a link sent to you in your email.
 */
class NewPassword extends Component {
  state = {
    passwords: [
      { id: 1, name: 'newPassword', value: '' },
      { id: 2, name: 'newPasswordRepeat', value: '' },
    ],
    success: false,
  };

  /**
   * This method is called when the component mounts.
   * It sets the value of the token in the state.
   */
  componentDidMount() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get('token');
    this.setState({ token: token });
  }

  /**
   * This method handles changes to the input fields of the form below.
   * @param {*} e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    let passwords = [...this.state.passwords];
    const index = e.target.id - 1;
    let item = { ...passwords[index] };
    item.value = e.currentTarget.value;
    passwords[index] = item;
    this.setState({ passwords });
  };

  /**
   * This method changes the type of the password input fields to text and back to password.
   * It helps the user see what they have typed in the fields.
   */
  handleVisibility = () => {
    var x = document.getElementById('1');
    var y = document.getElementById('2');
    if (x.type === 'password') {
      x.type = 'text';
      y.type = 'text';
    } else {
      x.type = 'password';
      y.type = 'password';
    }
  };

  /**
   * Is ccalled when the form is submitted.
   * Will make an api call to change the passsword in the database.
   * @param {*} e, submit event. PreventDefault is called on this event to prevent that the page reloads.
   */
  handleSubmit = (e) => {
    e.preventDefault();

    const valid = passwordIsValid(this.state.passwords[0], this.state.passwords[1]);
    if (valid) {
      this.setState({ errMessage: '' });

      let jsonObject = { password: this.state.passwords[0].value };
      API.post('/auth/reset-password?token=' + this.state.token, jsonObject)
        .then(() => {
          this.setState({ success: true });
        })
        .catch((err) => {
          if (err.response.data) {
            if (err.response.data.message) {
              const errorMess = err.response.data.message;
              const translated = translateErrors(errorMess);
              this.setState({ errMessage: translated });
            }
          } else {
            this.setState({ errMessage: 'Er is iets misgegaan. Waarschijnlijk is je link verlopen, vraag een nieuwe aan!' });
          }
        });
    } else {
      this.setState({ errMessage: 'Wachtwoorden komen niet overeen' });
    }
  };

  render() {
    return (
      <div data-testid="screen">
        <Menu />
        <Link to="/">
          <button data-testid="back" className="fa fa-home home-newPassword"></button>
        </Link>
        <div className="center-newPassword">
          <h4>Herstel wachtwoord</h4>
          {this.state.errMessage && (
            <div className="error-newPassword">
              <span className="fa fa-exclamation-triangle triangle-newPassword" />
              <p className="error-text-newPassword">{this.state.errMessage}</p>
            </div>
          )}
          {!this.state.success && (
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <div>
                <input
                  placeholder="Nieuw wachtwoord"
                  type="password"
                  id="1"
                  required="required"
                  data-testid="password"
                  onChange={this.handleChange}
                />
                <span
                  onClick={this.handleVisibility}
                  data-testid="visibility"
                  className="fa fa-fw fa-eye eye-icon-newPassword"
                />
              </div>
              <input
                placeholder="Herhaal wachtwoord"
                type="password"
                id="2"
                required="required"
                data-testid="passwordRepeat"
                onChange={this.handleChange}
              />
              <button type="submit" data-testid="submit">
                Stel in
              </button>
            </form>
          )}
          {this.state.success && (
            <div className="center success-newPassword">
              <span className="fa fa-check-circle circle-newPassword" />
              <h4 className="success-text-newPassword">
                Gelukt! Je wachtwoord is gewijzigd. Ga terug naar de startpagina om in te loggen
              </h4>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default NewPassword;
