import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/API';
import Menu from './Components/Menu';
import './stylesheets/CheckInHistory.css';

class CheckInHistory extends Component {
  state = {
    userID: localStorage.getItem('userId'),
    history: [],
    empty: false,
  };

  /**
   * When the component is mounted the check in history will be requested from the database.
   * If they have not been checked in set empty to true.
   * Else add history to the state
   */
  componentDidMount() {
    API.get('/checkIns/history/' + this.state.userID)
      .then((res) => {
        if (res.data.length === 0) {
          this.setState({ empty: true });
        } else {
          let history = [];
          res.data.map((result) => history.push({ date: result.date, id: result.id }));
          this.setState({ history: history });
        }
      })
      .catch(() => {
        this.setState({ errMessage: 'Er is iets misgegaan' });
      });
  }

  /**
   * Handles cahnge in the checkbox.
   * If the checkbox is checked is enables the delete button.
   * If the checkbox is unchecked it disables the delete button.
   */
  handleChange = () => {
    if (document.getElementById('deleteHistory').checked) {
      document.getElementById('submit_button').disabled = false;
    } else {
      document.getElementById('submit_button').disabled = true;
    }
  };

  /**
   * This method clears all the user's check in history
   * @param {*} e event from the form
   */
  handleSubmit = (e) => {
    e.preventDefault();

    API.get('checkIns/clearHistory/' + this.state.userID)
      .then(() => {
        this.setState({ message: 'Geschiedenis is verwijderd.', history: [], empty: true });
      })
      .catch(() => {
        this.setState({ errMessage: 'Er is iets misgegaan' });
      });
  };

  render() {
    return (
      <div className="mobile-width" data-testid="screen">
        <Menu />
        <Link to="/User/AccountDetails">
          <button data-testid="back" className="fa fa-angle-double-left back-history"></button>
        </Link>
        <h3 className="center-history">Bezoek geschiedenis</h3>
        <div className="center-history">
          {this.state.errMessage && (
            <div className="error-history">
              <span className="fa fa-exclamation-triangle triangle-history" />
              <p className="error-text-history">{this.state.errMessage}</p>
            </div>
          )}
          {this.state.message && (
            <div className="center success-history">
              <span className="fa fa-check-circle circle-history" />
              <h4 className="success-text-history">{this.state.message}</h4>
            </div>
          )}
          {this.state.empty && <h4> Je bent nog nooit ingecheckt. Kom een keer langs!</h4>}
          {!this.state.empty && (
            <div data-testid="table">
              <p>Je bent {this.state.history.length} keer ingecheckt.</p>
              <p>Dit zijn de dagen waarop je bent langsgekomen:</p>
              <table>
                {this.state.history.map((h) => (
                  <tbody key={h.id}>
                    <tr>
                      <td>
                        {h.date.substring(0, 10)} om {h.date.substring(11, 16)}
                      </td>
                    </tr>
                  </tbody>
                ))}
              </table>
              <form onSubmit={(e) => this.handleSubmit(e)} className="container-history">
                <label className="checkbox-label-history">
                  <input
                    type="checkbox"
                    id="deleteHistory"
                    name="checkbox"
                    value="check"
                    data-testid="deleteHistory"
                    onChange={this.handleChange}
                    className="check-history"
                    style={{ margin: '10px', marginLeft: '0px' }}
                  />
                  Ik wil mijn geschiedenis verwijderen
                </label>
                <button
                  type="submit"
                  id="submit_button"
                  data-testid="delete"
                  name="Verwijderen"
                  value="submit"
                  disabled={true}
                  onClick={this.handleDelete}
                  className="btn-grad-border"
                >
                  Verwijder
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CheckInHistory;
