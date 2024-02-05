import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Components/Menu';
import API from '../utils/API';
import { passwordIsValid, translateErrors } from '../services/Functions';
import './stylesheets/EditPassword.css';

/**This is a form to edit your password when you are already logged in
 * You can get to this form via the account details screen
 */
class EditPassword extends Component {
  state = {
    userID: localStorage.getItem('userId'),
    passwords: [
      { id: 1, name: 'currentPassword', value: '' },
      { id: 2, name: 'newPassword', value: '' },
      { id: 3, name: 'newPasswordRepeat', value: '' },
    ],
    success: false,
    errMessage: '',
  };

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
  handleVisibilityOld = () => {
    var x = document.getElementById('1');
    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }
  };

  /**
   * This method changes the type of the password input fields to text and back to password.
   * It helps the user see what they have typed in the fields.
   */
  handleVisibilityNew = () => {
    var y = document.getElementById('2');
    var z = document.getElementById('3');
    if (y.type === 'password') {
      y.type = 'text';
      z.type = 'text';
    } else {
      y.type = 'password';
      z.type = 'password';
    }
  };

  /**
   * Handles the changing of the password.
   * Makes an API call to change the values in the database and to control the fill in their current password correctly
   * @param {} e, event, it's default is preveted, to prevent reloading the page
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const valid = passwordIsValid(this.state.passwords[1], this.state.passwords[2]);
    if (valid) {
      const dataForm = new FormData();
      dataForm.append('oldPassword', this.state.passwords[0].value);
      dataForm.append('newPassword', this.state.passwords[1].value);
      let jsonObject = {};
      for (const [key, value] of dataForm) {
        jsonObject[key] = value;
      }
      API.patch('/users/changePassword/' + this.state.userID, jsonObject)
        .then(() => {
          this.setState({ success: true, errMessage: '' });
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.data.message === 'Incorrect password') {
              this.setState({ errMessage: 'Je huidige wachtwoord is incorrect' });
            } else {
              const errorMess = err.response.data.message;
              const translated = translateErrors(errorMess);
              this.setState({ errMessage: translated });
            }
          } else {
            this.setState({ errMessage: 'Er is iets misgegaan' });
          }
        });
    } else {
      this.setState({ errMessage: 'Wachtwoorden komen niet overeen' });
    }
  };

  render() {
    return (
      <div className="mobile-width" data-testid="screen">
        <Menu />
        <Link to="/User/AccountDetails/">
          <button data-testid="back" className="fa fa-angle-double-left back-editPassword"></button>
        </Link>
        <div className="center-editPassword">
          <h3>Wachtwoord wijzigen</h3>
          {this.state.errMessage && (
            <div className="error-editPassword">
              <span className="fa fa-exclamation-triangle triangle-editPassword" />
              <p className="error-text-editPassword">{this.state.errMessage}</p>
            </div>
          )}

          {!this.state.success && (
            <form onSubmit={(e) => this.handleSubmit(e)}>
              <div>
                <input
                  placeholder="Huidige wachtwoord"
                  type="password"
                  id="1"
                  data-testid="current"
                  required="required"
                  onChange={this.handleChange}
                />
                <span
                  onClick={this.handleVisibilityOld}
                  data-testid="visibilityOld"
                  className="fa fa-fw fa-eye eye-icon-editPassword"
                />
              </div>
              <div>
                <input
                  placeholder="Nieuw wachtwoord"
                  type="password"
                  id="2"
                  required="required"
                  data-testid="newOne"
                  onChange={this.handleChange}
                />
                <span
                  onClick={this.handleVisibilityNew}
                  data-testid="visibilityNew"
                  className="fa fa-fw fa-eye eye-icon-editPassword"
                />
              </div>
              <input
                placeholder="Herhaal nieuw wachtwoord"
                type="password"
                id="3"
                data-testid="newTwo"
                required="required"
                onChange={this.handleChange}
              />
              <button type="submit" data-testid="change">
                Wijzigen
              </button>
            </form>
          )}

          {this.state.success && (
            <div className="center success-editPassword">
              <span className="fa fa-check-circle circle-editPassword" />
              <h4 className="success-text-editPassword">Je wachtwoord is succesvol gewijzigd!</h4>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default EditPassword;
