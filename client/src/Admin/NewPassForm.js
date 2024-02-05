import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/API';
import { format, addYears } from 'date-fns';
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from '../Components/Cropper';
import './stylesheets/NewPassForm.css';
import MenuBar from './Components/Menu';

/**Class for admin to add a pass to a user account */
class NewPassForm extends Component {
  state = {
    userId: window.location.pathname.split('/')[3],
    firstName: '',
    lastName: '',
    err: '',
    type: '',
    startDate: format(Date.now(), 'yyyy-MM-dd'),
    endDate: format(addYears(Date.now(), 1), 'yyyy-MM-dd'),
    img: '',
  };

  /**
   * This method retrieves the user's name.
   */
  componentDidMount() {
    if (!this.state.userId) {
      this.setState({
        err: 'Geen gebruiker gespecificeerd',
      });
    } else {
      api
        .get('/users/' + this.state.userId)
        .then((res) => {
          this.setState({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
          });
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 400 || err.response.status === 404) {
              this.setState({
                err: 'Gebruiker niet gevonden',
              });
            } else {
              this.setState({
                err: 'Er is iets misgegaan',
              });
            }
          } else {
            this.setState({
              err: 'Er is iets misgegaan',
            });
          }
        });
    }
  }

  /**
   * This method handles changes to the input fields of the form.
   * @param {*} e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    this.setState({
      errPass: '',
    });

    let id = e.currentTarget.id;
    const val = e.currentTarget.value;

    if (id === '1' || id === '2') {
      this.setState({ type: val });
    } else if (id === '3') {
      if (val < this.state.endDate) {
        this.setState({
          startDate: val,
        });
      }
    } else if (id === '4') {
      if (this.state.startDate < val) {
        this.setState({
          endDate: val,
        });
      }
    }
  };

  /**
   * This methods updates the source of the image when cropped.
   * @param img
   */
  handleCropComplete = (img) => {
    this.setState({ img });
  };

  /**
   * This method sends the pass to the server.
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();

    api
      .post('/tickets/', {
        userId: this.state.userId,
        type: this.state.type,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        img: this.state.img,
      })
      .then(() => {
        window.location.replace('/Admin/UserDetails/' + this.state.userId);
      })
      .catch(() => {
        this.setState({
          errPass: 'Pas toevoegen mislukt',
        });
      });
  };

  render() {
    return (
      <div>
        <MenuBar />
        <div className="center">
          {this.state.err && (
            <div className="error-newPass">
              <span className="fa fa-exclamation-triangle triangle" />
              <p data-testid="err-msg" className="error-text">
                {this.state.err}
              </p>
            </div>
          )}
          {!this.state.err && (
            <div>
              <h2 data-testid="name">
                Nieuwe pas voor {this.state.firstName} {this.state.lastName}
              </h2>
              {this.state.errPass && (
                <div className="error-newPass">
                  <span className="fa fa-exclamation-triangle triangle" />
                  <p data-testid="err-add-pass" className="error-text">
                    {this.state.errPass}
                  </p>
                </div>
              )}
              <form onSubmit={(e) => this.handleSubmit(e)}>
                <label>Type: </label>
                <div className="passes">
                  <input type="radio" id="1" name="type" value="year" onChange={this.handleChange} required />
                  <label>Jaarpas</label>
                  <input type="radio" id="2" name="type" value="one-time" onChange={this.handleChange} />
                  <label>Dagpas</label>
                </div>
                <br />
                <label>Begin datum: </label>
                <input
                  data-testid="start-date"
                  id="3"
                  placeholder="Begin datum"
                  type="date"
                  onChange={this.handleChange}
                  value={this.state.startDate}
                />
                <br />
                <label>Verloopdatum: </label>
                <input
                  data-testid="end-date"
                  id="4"
                  placeholder="Eind datum"
                  type="date"
                  onChange={this.handleChange}
                  value={this.state.endDate}
                />
                <br />
                <label>Foto: </label>
                <Cropper onCropComplete={this.handleCropComplete} />
                <br />
                <button data-testid="submit" type="submit">
                  Pas toevoegen
                </button>
              </form>
              <Link to={'/Admin/UserDetails/' + this.state.userId}>
                <button>Annuleren</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default NewPassForm;
