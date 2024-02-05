import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/API';
import { format, addYears } from 'date-fns';
import Cropper from '../Components/Cropper';
import Menu from './Components/Menu';
import './stylesheets/BuyPass.css';

/** Form to buy a pass */
class BuyPassForm extends Component {
  state = {
    userId: localStorage.getItem('userId'),
    firstName: '',
    lastName: '',
    startDate: format(Date.now(), 'yyyy-MM-dd'),
    endDate: format(addYears(Date.now(), 1), 'yyyy-MM-dd'),
    type: 'Jaarpas',
    cost: '€8,50',
    image: '',
    err: false,
    errMessage: '',
    checking: false,
  };

  /**
   * This is method is called when the component is mounted.
   * It retrieves the user's name and sets the values in the state.
   */
  componentDidMount() {
    API.get('/users/' + this.state.userId)
      .then((res) => {
        this.setState({ firstName: res.data.firstName, lastName: res.data.lastName });
      })
      .catch(() => {
        this.setState({ err: true, errMessage: 'Er is iets misgegaan' });
      });
  }

  /**
   * This method handles changes in the form.
   * @param {*} e is an event. It has the ids and values of the  input fields
   */
  handleChange = (e) => {
    const id = e.currentTarget.id;
    const value = e.currentTarget.value;
    if (id === '1' || id === '2') {
      this.setState({ type: value });
      if (value === 'Jaarpas') {
        this.setState({ cost: '€8,50' });
      } else {
        this.setState({ cost: '€2,00' });
      }
    } else if (id === '3') {
      this.setState({ image: value });
    }
  };

  /**
   * This methods updates the source of the image when cropped.
   * @param image
   */
  handleCropComplete = (image) => {
    this.setState({ image });
  };

  handleCheck = () => {
    if (this.state.checking) {
      this.setState({ checking: false });
    } else {
      this.setState({ checking: true });
    }
  };

  /**
   * Handles submitting the form.
   * Stores the ticket details in local storage for use during payment
   * @param {*} e event. preventDefault is called to refrain the event from refreshing the page
   */
  handleSubmit = (e) => {
    e.preventDefault();

    // store ticket details
    if (this.state.type === 'Jaarpas') {
      localStorage.setItem('cartTicketType', 'year');
    } else {
      localStorage.setItem('cartTicketType', 'one-time');
    }
    localStorage.setItem('cartImage', this.state.image);

    // send to payment page
    window.location.replace('/User/CheckOut');
  };

  render() {
    return (
      <div className="mobile-width" data-testid="screen">
        <Menu />
        <div className="center-buy">
          {this.state.err && (
            <div className="error-buy">
              <span className="fa fa-exclamation-triangle triangle-buy" />
              <p className="error-text-buy">{this.state.errMessage}</p>
            </div>
          )}

          <form onSubmit={(e) => this.handleSubmit(e)}>
            {!this.state.checking && (
              <div>
                <h4 data-testid="title"> Pas kopen</h4>
                <h5 data-testid="name">
                  Op naam van: {this.state.firstName} {this.state.lastName}
                </h5>
                <div className="passes-buy">
                  <input
                    type="radio"
                    id="1"
                    name="passType"
                    value="Jaarpas"
                    onChange={this.handleChange}
                    defaultChecked={this.state.type === 'Jaarpas'}
                    data-testid="year"
                  />
                  <label>Jaarpas </label>
                  <input
                    type="radio"
                    id="2"
                    name="passType"
                    value="Eenmalig"
                    onChange={this.handleChange}
                    defaultChecked={this.state.type === 'Eenmalig'}
                    data-testid="day"
                  />
                  <label>Dagpas </label>
                </div>
                <label>Kosten: {this.state.cost} </label>
                <label>Startdatum: {this.state.startDate} </label>
                <label>Kaart zal komen te vervallen op: {this.state.endDate} </label>
                <label>Foto:</label>
                <Cropper onCropComplete={this.handleCropComplete} />
                <button type="button" onClick={this.handleCheck} data-testid="check">
                  Kopen
                </button>{' '}
              </div>
            )}
            {this.state.checking && (
              <div>
                <h3>Controleer bestelling</h3>
                <h5>
                  Op naam van: {this.state.firstName} {this.state.lastName}
                </h5>
                <h5>Type pas: {this.state.type}</h5>
                <h5>Kosten: {this.state.cost}</h5>
                <h5>Pas zal ingaan op: {this.state.startDate}</h5>
                <h5>Pas zal komen te vervallen op: {this.state.endDate} </h5>
                <img alt="Not available" src={this.state.image} width="100" height="100" />
                <button type="button" onClick={this.handleCheck} data-testid="change">
                  {' '}
                  Wijzigen
                </button>
                {/* Will send to the payment processor */}
                <button type="submit" onClick={this.handleSubmit} data-testid="submit">
                  Doorgaan naar betalen
                </button>
              </div>
            )}
          </form>
          <Link to="/User/Overview">
            <button>Annuleren</button>
          </Link>
        </div>
      </div>
    );
  }
}

export default BuyPassForm;
