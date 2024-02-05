import React, { Component } from 'react';
import { getSchools, filterCity } from '../services/Functions';
import './stylesheets/RegisterTemplate.css';

/**Template for registering or adding a new user
 * Will be renderd in NewUserForm and Register
 */
class RegisterTemplate extends Component {
  state = {
    //The arrays will have inputs after the component has mounted
    dutchCities: [],
    schools: [],
    role: '',
  };

  /**
   * When the react component is mounted, this function will be called.
   * In this function calls filtercity, getGender and getSchools.
   * It will set the state to the return value of filtercity, getGender and getSchools
   */
  componentDidMount() {
    const dutchCities = filterCity();
    const schools = getSchools();
    const role = this.props.role;
    this.setState({ dutchCities, schools, role });
  }

  /**
   * This method changes the type of the password input fields to text and back to password.
   * It helps the user see what they have typed in the fields.
   */
  handleVisibility = () => {
    var x = document.getElementById('4');
    var y = document.getElementById('5');
    if (x.type === 'password') {
      x.type = 'text';
      y.type = 'text';
    } else {
      x.type = 'password';
      y.type = 'password';
    }
  };

  render() {
    return (
      <div className="register-container" key="screen">
        <form data-testid="form" key="register" onSubmit={(e) => this.props.onSubmit(e)}>
          <input
            className="register-input"
            data-testid="fname"
            placeholder="Voornaam*"
            type="text"
            id="1"
            key="fname"
            required="required"
            onChange={this.props.onChange}
          />
          <input
            className="register-input"
            data-testid="lname"
            placeholder="Achternaam*"
            type="text"
            id="2"
            key="lname"
            required="required"
            onChange={this.props.onChange}
          />
          <input
            className="register-input"
            data-testid="email"
            placeholder="Email*"
            type="email"
            id="3"
            key="email"
            required="required"
            onChange={this.props.onChange}
          />
          <div className="password-field-container">
            <input
              className="register-input"
              data-testid="password"
              placeholder="Wachtwoord*"
              type="password"
              id="4"
              key="password"
              required="required"
              onChange={this.props.onChange}
            />
            <span
              onClick={this.handleVisibility}
              type="button"
              data-testid="visibility"
              className="fa fa-fw fa-eye eye-icon"
            />
          </div>
          <input
            className="register-input"
            data-testid="passwordRepeat"
            placeholder="Herhaal wachtwoord*"
            type="password"
            id="5"
            key="passwordRepeat"
            required="required"
            onChange={this.props.onChange}
          />
          <input
            className="register-input"
            data-testid="dateOfBirth"
            placeholder="Geboortedatum*"
            type="date"
            id="6"
            key="dateOfBirth"
            required="required"
            onChange={this.props.onChange}
          />
          <div className="genders-container">
            <input name="gender" value="Man" type="radio" key="Man" id="10" onChange={this.props.onChange} />
            <label>Man</label>
            <input name="gender" value="Vrouw" type="radio" key="Vrouw" id="20" onChange={this.props.onChange} />
            <label>Vrouw</label>
            <input name="gender" value="Anders" type="radio" key="Anders" id="30" onChange={this.props.onChange} />
            <label>Anders</label>
          </div>

          <select className="register-select" id="8" key="city" onChange={this.props.onChange}>
            {this.state.dutchCities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          <div key="selectUni">
            <select className="register-select" id="9" key="uni" onChange={this.props.onChange}>
              {this.state.schools.map((school) => (
                <option key={school}>{school}</option>
              ))}
            </select>
          </div>
          {this.state.role === 'admin' && (
            <div className="role-container">
              <input
                name="role"
                value="admin"
                type="radio"
                key="admin"
                id="40"
                onChange={this.props.onChange}
                data-testid="admin"
              />
              <label>Admin</label>
              <input
                name="role"
                value="user"
                type="radio"
                key="user"
                id="50"
                onChange={this.props.onChange}
                data-testid="user"
              />
              <label>User</label>
            </div>
          )}
          <button className="middle" data-testid="submit-button" id="submit-button" key="submitRegister" type="submit">
            Registreer
          </button>
        </form>
      </div>
    );
  }
}

export default RegisterTemplate;
