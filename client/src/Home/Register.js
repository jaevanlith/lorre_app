import React, { Component } from 'react';
import RegisterTemplate from './RegisterTemplate';
import { passwordIsValid, formToObject, translateErrors, checkDate } from '../services/Functions';
import API from '../utils/API';
import { Link } from 'react-router-dom';
import './stylesheets/Register.css';
import Menu from './Components/Menu';

/**Class for Registering
 * Makes use of the RegisterTemplate
 */
class Register extends Component {
  state = {
    user: [
      { id: '1', name: 'firstName', value: '' },
      { id: '2', name: 'lastName', value: '' },
      { id: '3', name: 'email', value: '' },
      { id: '4', name: 'password', value: '' },
      { id: '5', name: 'passwordRepeat', value: '' },
      { id: '6', name: 'dateOfBirth', value: '' },
      { id: '7', name: 'gender', value: '' },
      { id: '8', name: 'city', value: '' },
      { id: '9', name: 'university', value: '' },
    ],
    otherFailed: false,
    userFailed: false,
    errMessage: '',
  };

  /**
   * This method handles changes to the input fields of the form below.
   * @param {*} e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    let user = [...this.state.user];
    let id = e.currentTarget.id;
    //All radio buttons should have different id, but manipulate the same user input;
    if (id === '10' || id === '20' || id === '30') {
      id = 7;
    }
    const index = id - 1;
    let item = { ...user[index] };
    item.value = e.currentTarget.value;
    user[index] = item;
    this.setState({ user });
  };

  /**
   * This method is called when the form is submitted.
   * It calls the passwordIsValid method and the formToObject method from Funxi
   * It also does an api post call.
   * @param {Event} e
   */
  handleSubmit = (e) => {
    e.preventDefault();

    const dateValid = checkDate(Date.now(), this.state.user[5].value);
    if (!dateValid) {
      this.setState({ userFailed: true, errMessage: 'Sorry je bent te jong. Je moet minstens 18 zijn om binnen te komen' });
    }

    const validity = passwordIsValid(this.state.user[3], this.state.user[4]);
    if (!validity) {
      this.setState({ userFailed: true, errMessage: 'Wachtwoorden komen niet overeen' });
    }

    if (validity && dateValid) {
      const user = this.state.user;
      const jsonObject = formToObject(user);

      API.post('auth/register', jsonObject)
        .then(() => {
          window.location.replace('/Login');
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 400) {
              const errMessage = err.response.data.message;
              const translated = translateErrors(errMessage);
              this.setState({ userFailed: true });
              this.setState({ errMessage: translated });
            } else {
              this.setState({ otherFailed: true });
              this.setState({ errMessage: 'Er is iets misgegaan' });
            }
          } else {
            this.setState({ otherFailed: true });
            this.setState({ errMessage: 'Er is iets misgegaan' });
          }
        });
    }
  };

  render() {
    return (
      <div data-testid="screen">
        <Menu />

        <p className="small-title text-center">Maak een nieuw account</p>
        {this.state.otherFailed && (
          <div
            className="error-register"
            data-testid="fail-message"
            // style={{ width: '200px', marginLeft: 'auto', marginRight: 'auto' }}
          >
            <span className="fa fa-exclamation-triangle triangle-register" />
            <p className="error-text-register">Er is iets misgegaan</p>
          </div>
        )}
        {this.state.userFailed && (
          <div className="error-register" data-testid="fail-message">
            <span className="fa fa-exclamation-triangle triangle-register" />
            <p className="error-text-register" data-testid="userFailed-message">
              {this.state.errMessage}
            </p>
          </div>
        )}

        <RegisterTemplate onSubmit={(e) => this.handleSubmit(e)} onChange={this.handleChange} role="user" />

        <form>
          <p style={{ textAlign: 'center' }}>
            Heb je al een account? <Link to="/">Inloggen</Link>
          </p>
        </form>
      </div>
    );
  }
}

export default Register;
