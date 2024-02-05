import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Pass from './Components/Pass';
import api from './../utils/API';
import { format, parseJSON } from 'date-fns';
import Menu from './Components/Menu';
import './stylesheets/UserDetails.css';

/**Class for showing the details and passes of a user to the admin */
class UserDetails extends Component {
  state = {
    userId: window.location.pathname.split('/')[3],
    admin: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    city: '',
    university: '',
    tickets: [],
    errUser: '',
    errPass: '',
    winWidth: window.innerWidth,
  };

  /**
   * This method retrieves the user's information and passes.
   */
  componentDidMount() {
    if (!this.state.userId) {
      this.setState({
        errUser: 'Geen gebruiker gespecificeerd',
      });
    } else {
      api
        .get('/users/' + this.state.userId)
        .then((res) => {
          const admin = (role) => {
            if (role === 'admin') {
              return 'Beheerder';
            } else {
              return '';
            }
          };

          const dateOfBirth = (date) => {
            if (date) {
              return format(parseJSON(date), 'dd-MM-yyyy');
            } else {
              return '';
            }
          };

          this.setState({
            admin: admin(res.data.role),
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
            dateOfBirth: dateOfBirth(res.data.dateOfBirth),
            city: res.data.city,
            university: res.data.university,
          });
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 400 || err.response.status === 404) {
              this.setState({
                errUser: 'Gebruiker niet gevonden',
              });
            } else {
              this.setState({
                errUser: 'Er is iets misgegaan',
              });
            }
          } else {
            this.setState({
              errUser: 'Er is iets misgegaan',
            });
          }
        });

      if (!this.state.admin) {
        api
          .get('/tickets/get/' + this.state.userId)
          .then((res) => {
            this.setState({
              tickets: res.data,
            });
          })
          .catch((err) => {
            this.setState({
              errPass: 'Passen ophalen mislukt',
            });
          });
      }
    }

    // Add event listener to track window resizing
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  /**
   * This method keeps track of the window size to distinguish desktop and mobile users.
   */
  handleWindowSizeChange = () => {
    this.setState({ winWidth: window.innerWidth });
  };

  /**
   * This method enables the delete account button, when box is checked.
   */
  enableDeleteBtn = () => {
    if (document.getElementById('deleteAccount').checked) {
      document.getElementById('submit_button').disabled = false;
    } else {
      document.getElementById('submit_button').disabled = true;
    }
  };

  /**
   * This method deletes the account
   */
  deleteAccount = (e) => {
    e.preventDefault();

    api
      .delete('/users/' + this.state.userId)
      .then((res) => {
        this.setState({
          errUser: 'Account verwijderd',
        });
      })
      .catch(() => {
        this.setState({
          errUser: 'Account verwijderen mislukt',
        });
      });
  };

  render() {
    /**
     * This method maps the tickets array into pass components.
     * @returns {Pass}
     */
    const passes = () => {
      if (this.state.tickets.length) {
        return this.state.tickets.map((ticket) => (
          <Pass
            key={ticket.id}
            passId={ticket.id}
            type={ticket.type}
            startDate={ticket.startDate}
            endDate={ticket.endDate}
            image={ticket.img}
          />
        ));
      } else {
        return <p data-testid="no-passes">Geen passen</p>;
      }
    };

    // Change classes for desktop / mobile
    const isMobile = this.state.winWidth <= 600;
    let detailsContainer = 'user-detail-container';
    let passesContainer = 'user-detail-pass-container';
    if (isMobile) {
      detailsContainer = 'mobile-' + detailsContainer;
      passesContainer = 'mobile-' + passesContainer;
    }

    return (
      <div>
        <Menu />

        <Link to="/Admin/Catalog">
          <button className="fa fa-angle-double-left" style={{ width: '36px' }} />
        </Link>

        {this.state.errUser && (
          <div className="error-user-detail">
            <span className="fa fa-exclamation-triangle triangle-user-detail" />
            <p className="error-text-user-detail" data-testid="err-user-msg">
              {this.state.errUser}
            </p>
          </div>
        )}

        {!this.state.errUser && (
          <div>
            <div className={detailsContainer}>
              <p className="user-detail-box-label">Account informatie</p>
              <div className="user-detail-bg">
                <p className="user-detail-title" data-testid="name">
                  {this.state.firstName} {this.state.lastName}
                </p>
                <h4 data-testid="admin">{this.state.admin}</h4>

                <p className="user-detail-label">ID</p>
                <p className="user-detail-val" data-testid="id">
                  {this.state.userId}
                </p>
                <p className="user-detail-label">Email</p>
                <p className="user-detail-val" data-testid="email">
                  {this.state.email}
                </p>
                <p className="user-detail-label">Geboortedatum</p>
                <p className="user-detail-val" data-testid="date-of-birth">
                  {this.state.dateOfBirth}
                </p>
                <p className="user-detail-label">Woonplaats</p>
                <p className="user-detail-val" data-testid="city">
                  {this.state.city}
                </p>
                <p className="user-detail-label">Onderwijsinstelling</p>
                <p className="user-detail-val" data-testid="university">
                  {this.state.university}
                </p>

                <form onSubmit={(e) => this.deleteAccount(e)}>
                  <input
                    className="user-detail-checkbox"
                    data-testid="checkbox"
                    type="checkbox"
                    id="deleteAccount"
                    name="checkbox"
                    value="check"
                    onChange={this.enableDeleteBtn}
                  />{' '}
                  <p className="user-detail-del-text">Ik wil dit account verwijderen</p>
                  <button
                    className="btn-grad-border"
                    data-testid="delete-btn"
                    type="submit"
                    id="submit_button"
                    name="Verwijderen"
                    value="submit"
                    disabled={true}
                  >
                    Verwijder
                  </button>
                </form>
              </div>
            </div>

            {this.state.errPass && (
              <div className="error-user-detail">
                <span className="fa fa-exclamation-triangle triangle-user-detail" />
                <p className="error-text-user-detail" data-testid="err-pass-msg">
                  {this.state.errPass}
                </p>
              </div>
            )}

            {!this.state.admin && !this.state.errPass && (
              <div className={passesContainer}>
                <p className="user-detail-box-label">Passen</p>
                <Link to={'/Admin/NewPassForm/' + this.state.userId}>
                  <button className="add-pass-btn btn-grad-border">Pas toevoegen</button>
                </Link>

                {passes()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default UserDetails;
