import React, { Component } from 'react';
import RegisterTemplate from '../Home/RegisterTemplate';
import { passwordIsValid, formToObject, translateErrors, checkDate } from '../services/Functions';
import API from '../utils/API';
import './stylesheets/NewUserForm.css';
import MenuBar from './Components/Menu';
import { Link } from 'react-router-dom';

/**Class to add a new user as an admin
 * Makes use of the RegisterTemplate.
 */
class NewUserForm extends Component {
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
      { id: '10', name: 'role', value: 'user' },
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
    if (id === '40' || id === '50') {
      id = 10;
    }
    const index = id - 1;
    let item = { ...user[index] };
    item.value = e.currentTarget.value;
    user[index] = item;
    this.setState({ user });
  };

  /**
   * This method is called when the form is submitted.
   * It calls the passwordIsValid method and the checkdate method
   * It also does ani api post call.
   * @param {Event} e
   */
  handleSubmit = (e) => {
    e.preventDefault();

    const validity = passwordIsValid(this.state.user[3], this.state.user[4]);
    if (!validity) {
      this.setState({ userFailed: true, errMessage: 'Wachtwoorden komen niet overeen' });
    }
    const dateValid = checkDate(Date.now(), this.state.user[5].value);
    if (!dateValid) {
      this.setState({ userFailed: true, errMessage: 'Sorry je bent te jong. Je moet minstens 18 zijn om binnen te komen' });
    }
    if (validity && dateValid) {
      const user = this.state.user;
      const jsonObject = formToObject(user);
      jsonObject['role'] = this.state.user[9].value;

      API.post('users/', jsonObject)
        .then(() => {
          window.location.replace('/Admin/Catalog');
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
      <div>
        <MenuBar />

        <Link to="/Admin/Catalog">
          <button className="fa fa-angle-double-left back-newUser" />
        </Link>

        <div data-testid="screen" className="mid">
          <h4>Account toevoegen</h4>

          {this.state.otherFailed && (
            <div className="error-newUser">
              <span className="fa fa-exclamation-triangle triangle" />
              <p data-testid="fail-message" className="error-text">
                Er is iets mis gegaan
              </p>
            </div>
          )}
          {this.state.userFailed && (
            <div className="error-newUser">
              <span className="fa fa-exclamation-triangle triangle-newUser" />
              <p data-testid="userFail-message" className="error-text-newUser">
                {this.state.errMessage}
              </p>
            </div>
          )}
          <RegisterTemplate onSubmit={(e) => this.handleSubmit(e)} onChange={this.handleChange} role="admin" />
        </div>
      </div>
    );
  }
}

export default NewUserForm;
