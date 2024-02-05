import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/API';
import AuthService from '../services/AuthService';
import { getSchools, filterCity, checkDate } from '../services/Functions';
import './stylesheets/AccountDetails.css';
import Menu from './Components/Menu';

/**Class for Account details screen */
class AccountDetails extends Component {
  state = {
    userId: localStorage.getItem('userId'),
    user: [
      { id: '1', name: 'firstName', value: '' },
      { id: '2', name: 'lastName', value: '' },
      { id: '3', name: 'email', value: '' },
      { id: '4', name: 'dateOfBirth', value: '' },
      { id: '5', name: 'gender', value: '' },
      { id: '6', name: 'city', value: '' },
      { id: '7', name: 'university', value: '' },
    ],
    userEdit: [
      { id: '1', name: 'firstName', value: '' },
      { id: '2', name: 'lastName', value: '' },
      { id: '3', name: 'email', value: '' },
      { id: '4', name: 'dateOfBirth', value: '' },
      { id: '5', name: 'gender', value: '' },
      { id: '6', name: 'city', value: '' },
      { id: '7', name: 'university', value: '' },
    ],
    errEdit: false,
    errOther: false,
    edit: false,
    deleted: false,
    //The arrays will have inputs after the component has mounted
    dutchCities: [],
    schools: [],
  };

  /**
   * When the react component is mounted, this function will be called.
   * In this function calls filtercity.
   * It will set the state to the return value of filtercity
   *
   * It will make an APi call to retrieve the user's data.
   */
  componentDidMount() {
    const dutchCities = filterCity();
    const schools = getSchools();
    this.setState({ dutchCities, schools });

    API.get('/users/' + this.state.userId)
      .then((res) => {
        let user = [...this.state.user];
        user[0].value = res.data.firstName;
        user[1].value = res.data.lastName;
        user[2].value = res.data.email;
        user[3].value = res.data.dateOfBirth.toString().substring(0, 10);
        user[4].value = this.refactorGender(res.data.gender);
        user[5].value = res.data.city;
        user[6].value = res.data.university;
        this.setState({ user: user, userEdit: user, err: false });
      })
      .catch(() => {
        this.setState({
          errOther: true,
          errMessage: 'Er is iets misgegaan',
        });
      });
  }

  /**
   * Translates the genders to dutch
   * @param {*} gender given by the result of the API
   */
  refactorGender = (gender) => {
    let g = gender;
    if (g === 'male') {
      g = 'Man';
    } else if (gender === 'female') {
      g = 'Vrouw';
    } else if (gender === 'other') {
      g = 'Anders';
    }
    return g;
  };

  /**
   * This method handles changes to the input fields of the form below.
   * @param {*} e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    let user = [...this.state.userEdit];
    const index = e.target.id - 1;
    let item = { ...user[index] };
    item.value = e.currentTarget.value;
    user[index] = item;
    this.setState({ userEdit: user });
  };

  /**
   * It changes the value of edit in the state which togggles whether you are viewing your account details or editting.
   * is called when clicking on the edit button, save button or cancel button
   */
  handleEdit = () => {
    if (this.state.edit) {
      this.setState({ edit: false, userEdit: this.state.user, errEdit: false, errOther: false });
    } else {
      this.setState({ edit: true, userEdit: this.state.user, errEdit: false, errOther: false });
    }
  };

  /**
   * This method enables and disables the delete button
   */
  handleCheck = () => {
    if (document.getElementById('deleteAccount').checked) {
      document.getElementById('deleteButton').disabled = false;
    } else {
      document.getElementById('deleteButton').disabled = true;
    }
  };

  /**
   * Is called when the delete butten is pressed
   * Makes an API call to delete the user's account
   * @param {*} e, event. It's default is prevented to prevent the page from being reloaded
   */
  handleDelete = (e) => {
    e.preventDefault();
    API.delete('/users/' + this.state.userId)
      .then(() => {
        this.setState({ deleted: true });
      })
      .catch(() => {
        this.setState({ errOther: true, errMessage: 'Verwijderen is mislukt' });
      });
  };

  /**
   * This methods is called when the form is submitted.
   * It calls the dateValid method.
   * It sends the user to the accountdetails page.
   * After updating the changes to the db
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const dateValid = checkDate(Date.now(), this.state.userEdit[3].value);
    if (dateValid) {
      const userEdit = this.state.userEdit;
      const jsonObject = this.formToObject(userEdit);

      API.patch('/users/' + this.state.userId, jsonObject)
        .then(() => {
          this.setState({ edit: false, user: userEdit });
        })
        .catch(() => {
          this.setState({
            errEdit: true,
            errMessage: 'Opslaan van je gegevens is mislukt',
          });
        });
    } else {
      this.setState({ errEdit: true, errMessage: 'Sorry je bent te jong. Je moet minstens 18 zijn om binnen te komen.' });
    }
  };
  /**
   * Transforms the data from the form into a jsonObject
   * @param {*} user
   */
  formToObject = (user) => {
    const dataForm = new FormData();
    for (var i = 0; i < 7; i++) {
      if (user[i].value) {
        if (user[i].name === 'gender') {
          let gender = user[i].value;
          if (gender === 'Man') {
            gender = 'male';
          } else if (gender === 'Vrouw') {
            gender = 'female';
          } else if (gender === 'Anders') {
            gender = 'other';
          }
          dataForm.append(user[i].name, gender);
        } else {
          dataForm.append(user[i].name, user[i].value);
        }
      }
    }
    let jsonObject = {};
    for (const [key, value] of dataForm) {
      jsonObject[key] = value;
    }
    return jsonObject;
  };

  render() {
    return (
      <div className="mobile-width" data-testid="screen">
        <Menu currentPage={'accountDetails'} />
        {!this.state.edit && !this.state.deleted && (
          <div>
            <h1 data-testid="title" className="center-ads">
              Persoonlijke Informatie
            </h1>
            <div className="center-ads">
              {this.state.errOther && (
                <div className="error-ads">
                  <span className="fa fa-exclamation-triangle triangle-ads" />
                  <p className="error-text-ads">{this.state.errMessage}</p>
                </div>
              )}
              <div>
                <div data-testid="fname" className="info-ads">
                  <label>Voornaam: </label>
                  <p>{this.state.user[0].value}</p>
                </div>
                <div data-testid="lname" className="info-ads">
                  <label>Achternaam: </label>
                  <p>{this.state.user[1].value}</p>
                </div>{' '}
                <div data-testid="email" className="info-ads">
                  <label>Email: </label>
                  <p>{this.state.user[2].value}</p>{' '}
                </div>{' '}
                <div data-testid="dateOfBirth" className="info-ads">
                  <label>Geboortedatum: </label>
                  <p>{this.state.user[3].value}</p>{' '}
                </div>
                <div data-testid="gender" className="info-ads">
                  <label>Geslacht: </label>
                  <p>{this.state.user[4].value}</p>
                </div>
                <div data-testid="city" className="info-ads">
                  <label>Woonplaats: </label>
                  <p>{this.state.user[5].value}</p>
                </div>{' '}
                <div data-testid="university" className="info-ads">
                  <label>Onderwijsinstelling: </label>
                  <p>{this.state.user[6].value}</p>{' '}
                </div>
              </div>
              <button data-testid="edit" onClick={this.handleEdit} className="fa fa-edit icon-ads"></button>
              <Link to="/User/History">
                <button className="fa fa-history icon-ads"></button>
              </Link>
              <form onSubmit={(e) => this.handleDelete(e)}>
                <div>
                  <label htmlFor="deleteAccount">
                    <input
                      type="checkbox"
                      data-testid="check"
                      id="deleteAccount"
                      name="checkbox"
                      value="check"
                      defaultChecked={false}
                      onChange={this.handleCheck}
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        paddingRight: '20px',
                        margin: '10px',
                        marginLeft: '0px',
                      }}
                    />
                    Ik wil mijn account definitief verwijderen.
                  </label>
                </div>
                <button
                  type="submit"
                  data-testid="delete"
                  id="deleteButton"
                  name="Verwijderen"
                  value="submit"
                  disabled={true}
                >
                  {' '}
                  Verwijderen
                </button>
              </form>
            </div>
          </div>
        )}
        {this.state.edit && !this.state.deleted && (
          <div>
            <button onClick={this.handleEdit} className="fa fa-window-close cancle-ads" />
            <div className="center-ads">
              <h1 data-testid="title-ads">Persoonlijke Informatie</h1>
              {this.state.errEdit && (
                <div className="error-ads">
                  <span className="fa fa-exclamation-triangle triangle-ads" />
                  <p className="error-text-ads">{this.state.errMessage}</p>
                </div>
              )}
              <form onSubmit={this.handleSubmit}>
                <div>
                  <div className="info-ads">
                    <label>Voornaam:</label>
                    <input
                      defaultValue={this.state.userEdit[0].value}
                      type="name"
                      required="required"
                      id="1"
                      data-testid="fnameEdit"
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="info-ads">
                    <label>Achternaam: </label>
                    <input
                      defaultValue={this.state.userEdit[1].value}
                      type="name"
                      required="required"
                      id="2"
                      data-testid="lnameEdit"
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="info-ads">
                    <label>Email: </label>
                    <input
                      defaultValue={this.state.userEdit[2].value}
                      type="email"
                      required="required"
                      id="3"
                      data-testid="emailEdit"
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="info-ads">
                    <label>Geboortedatum: </label>
                    <input
                      defaultValue={this.state.userEdit[3].value}
                      type="date"
                      required="required"
                      id="4"
                      data-testid="dateEdit"
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className="info-ads">
                  <label className="g-label-ads">Geslacht: </label>
                  <div className="genders-ads">
                    <input
                      name="gender"
                      value="Man"
                      type="radio"
                      key="Man"
                      id="5"
                      data-testid="ManEdit"
                      defaultChecked={this.state.userEdit[4].value === 'Man'}
                      onChange={this.handleChange}
                    />{' '}
                    Man
                    <input
                      name="gender"
                      value="Vrouw"
                      type="radio"
                      key="Vrouw"
                      id="5"
                      data-testid="VrouwEdit"
                      defaultChecked={this.state.userEdit[4].value === 'Vrouw'}
                      onChange={this.handleChange}
                    />{' '}
                    Vrouw
                    <input
                      name="gender"
                      value="Anders"
                      type="radio"
                      key="Anders"
                      id="5"
                      data-testid="AndersEdit"
                      defaultChecked={this.state.userEdit[4].value === 'Anders'}
                      onChange={this.handleChange}
                    />{' '}
                    Anders
                  </div>
                </div>
                <div>
                  <div className="info-ads">
                    <label>Woonplaats: </label>
                    <select
                      className="account-details-select"
                      id="6"
                      key="city"
                      data-testid="cityEdit"
                      value={this.state.userEdit[5].value}
                      onChange={this.handleChange}
                    >
                      {this.state.dutchCities.map((city) => (
                        <option key={city}>{city}</option>
                      ))}
                    </select>
                  </div>{' '}
                  <div className="info-ads">
                    <label>Onderwijsinstelling: </label>
                    <select
                      className="account-details-select"
                      id="7"
                      data-testid="universityEdit"
                      value={this.state.userEdit[6].value}
                      onChange={this.handleChange}
                    >
                      {this.state.schools.map((school) => (
                        <option key={school}>{school}</option>
                      ))}
                    </select>{' '}
                  </div>
                </div>
                <button type="submit" data-testid="save">
                  Opslaan
                </button>
              </form>
              <Link to="/User/EditPassword">
                <button data-testid="changePassword">Wachtwoord wijzigen</button>
              </Link>{' '}
            </div>
          </div>
        )}
        {this.state.deleted && (
          <div className="center-ads">
            <h1>Je account is verwijderd.</h1>
            <button data-testid="logout" onClick={AuthService.logout}>
              Terug naar de startpagina
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default AccountDetails;
