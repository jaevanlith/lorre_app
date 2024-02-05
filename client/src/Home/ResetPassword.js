import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Components/Menu';
import API from '../utils/API';
import './stylesheets/ResetPassword.css';
/**
 * Form for resetting your password.
 * You can get here via the HomeScreen.
 */
class ResetPassword extends Component {
  state = {
    email: '',
    send: false,
  };

  handleChange = (e) => {
    let email = [...this.state.email];
    email = e.currentTarget.value;
    this.setState({ email });
  };
  handleSubmit = (e) => {
    e.preventDefault();

    const dataForm = new FormData();
    dataForm.append('email', this.state.email);
    let jsonObject = {};
    for (const [key, value] of dataForm) {
      jsonObject[key] = value;
    }
    API.post('/auth/forgot-password', jsonObject)
      .then((res) => {
        this.setState({ send: true, errMessage: '' });
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 404) {
            this.setState({ errMessage: 'Dit e-mailadres staat niet in ons systeem' });
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
      <div data-testid="screen">
        <Menu />
        <Link to="/">
          <button data-testid="back" className="fa fa-angle-double-left back-reset"></button>
        </Link>
        {!this.state.send && (
          <div>
            <div className="center-reset">
              <h4>Herstel je wachtwoord</h4>
              {this.state.errMessage && (
                <div className="error-reset">
                  <span className="fa fa-exclamation-triangle triangle-reset" />
                  <p className="error-text-reset">{this.state.errMessage}</p>
                </div>
              )}
              <p>Vul je e-mailadres in, er zal een e-mail verstuurd worden met een link om je wachtwoord te herstellen.</p>
              <form onSubmit={(e) => this.handleSubmit(e)}>
                <input placeholder="Email" type="email" required="required" onChange={this.handleChange} />
                <button type="submit" data-testid="send">
                  Stuur link
                </button>
              </form>
            </div>
          </div>
        )}
        {this.state.send && (
          <div className="center success-reset">
            <span className="fa fa-check-circle circle-reset" />
            <h4 className="success-text-reset">Er is een email verstuurd. Check ook je spam.</h4>
          </div>
        )}
      </div>
    );
  }
}

export default ResetPassword;
