import React, { Component } from 'react';
import api from './../utils/API';
import GenderChart from './Components/Charts/GenderChart';
import AgeChart from './Components/Charts/AgeChart';
import UniCityChart from './Components/Charts/UniCityChart';
import TimeChart from './Components/Charts/TimeChart';
import Menu from './Components/Menu';
import './stylesheets/Analytics.css';
import { defaults } from 'react-chartjs-2';

// Set the font family and color for the charts
defaults.global.defaultFontColor = '#FFFFFF';

/**Class for analytics screen, where the admin can display customer analytics */
class Analytics extends Component {
  state = {
    category: {
      gender: false,
      age: false,
      university: false,
      city: false,
      time: false,
    },
    time: {
      allTime: false,
      interval: false,
      startDate: '',
      endDate: '',
    },
    results: [],
    errMsg: '',
    display: {
      gender: false,
      age: false,
      university: false,
      city: false,
      time: false,
    },
    displayDropdown: 'hidden',
    winWidth: window.innerWidth,
  };

  componentDidMount() {
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
   * This method handles changes made to the category checkboxes.
   * @param e, e is an event
   */
  handleCategoryChange = (e) => {
    let category = this.state.category;
    const id = e.target.id;

    if (id === '1') {
      category.gender = !category.gender;
    } else if (id === '2') {
      category.age = !category.age;
    } else if (id === '3') {
      category.university = !category.university;
    } else if (id === '4') {
      category.city = !category.city;
    } else if (id === '9') {
      category.time = !category.time;
    }

    this.setState({
      category,
      errMsg: '',
    });
  };

  /**
   * This method handles changes made to the time interval part of the form.
   * @param e, e is an event
   */
  handleTimeChange = (e) => {
    let time = this.state.time;
    const id = e.target.id;
    const val = e.target.value;

    if (id === '5') {
      time.allTime = true;
      time.interval = false;
    } else if (id === '6') {
      time.interval = true;
      time.allTime = false;
    } else if (id === '7') {
      if (!this.state.time.endDate || val <= this.state.time.endDate) {
        time.startDate = val;
      }
    } else if (id === '8') {
      if (!this.state.time.startDate || this.state.time.startDate <= val) {
        time.endDate = val;
      }
    }

    this.setState({
      time,
      errMsg: '',
    });
  };

  /**
   * This method requests the analytics from the server.
   * @param e, e is an event
   */
  handleSubmit = (e) => {
    e.preventDefault();

    let url = '/analytics/';

    if (this.state.time.interval) {
      url += 'queryTimeInterval?startDate=' + this.state.time.startDate + '&endDate=' + this.state.time.endDate + '&';
    } else {
      url += 'queryAllTime?';
    }

    url +=
      'gender=' +
      (this.state.category.gender ? 1 : 0) +
      '&dateOfBirth=' +
      (this.state.category.age ? 1 : 0) +
      '&university=' +
      (this.state.category.university ? 1 : 0) +
      '&city=' +
      (this.state.category.city ? 1 : 0);

    api
      .get(url)
      .then((res) => {
        // Only show the components, when api call successful
        const display = { ...this.state.category };

        this.setState({
          results: res.data,
          display,
        });
      })
      .catch(() => {
        this.setState({
          errMsg: 'Statistieken ophalen mislukt',
        });
      });
  };

  /**
   * This function shows/hides the multi select menu.
   */
  handleDropdown = () => {
    const displayDropdown = this.state.displayDropdown === 'hidden' ? 'visible' : 'hidden';
    this.setState({ displayDropdown });
  };

  render() {
    const isMobile = this.state.winWidth <= 600;
    let formContainer = 'form-container';
    let chartsContainer = 'charts-container';
    if (isMobile) {
      formContainer = 'mobile-' + formContainer;
      chartsContainer = 'mobile-' + chartsContainer;
    }

    return (
      <div>
        <Menu />

        <div className={formContainer}>
          <form onSubmit={(e) => this.handleSubmit(e)}>
            <div className="multiselect-input" onClick={this.handleDropdown}>
              Categorieën
              <span className="multiselect-icon fa fa-angle-down" />
            </div>
            <div className="multiselect-dropdown" style={{ visibility: this.state.displayDropdown }}>
              <div>
                <span
                  className="multiselect-check-icon fa fa-check"
                  style={{
                    visibility:
                      this.state.displayDropdown === 'visible' && this.state.category.gender ? 'visible' : 'hidden',
                  }}
                />
                <label data-testid="gender" id="1" onClick={this.handleCategoryChange} className="multiselect-label">
                  Geslacht
                </label>
              </div>
              <div>
                <span
                  className="multiselect-check-icon fa fa-check"
                  style={{
                    visibility: this.state.displayDropdown === 'visible' && this.state.category.age ? 'visible' : 'hidden',
                  }}
                />
                <label data-testid="age" id="2" onClick={this.handleCategoryChange} className="multiselect-label">
                  Leeftijd
                </label>
              </div>
              <div>
                <span
                  className="multiselect-check-icon fa fa-check"
                  style={{
                    visibility:
                      this.state.displayDropdown === 'visible' && this.state.category.university ? 'visible' : 'hidden',
                  }}
                />
                <label data-testid="university" id="3" onClick={this.handleCategoryChange} className="multiselect-label">
                  Onderwijsinstelling
                </label>
              </div>
              <div>
                <span
                  className="multiselect-check-icon fa fa-check"
                  style={{
                    visibility: this.state.displayDropdown === 'visible' && this.state.category.city ? 'visible' : 'hidden',
                  }}
                />
                <label data-testid="city" id="4" onClick={this.handleCategoryChange} className="multiselect-label">
                  Woonplaats
                </label>
              </div>
              <div>
                <span
                  className="multiselect-check-icon fa fa-check"
                  style={{
                    visibility: this.state.displayDropdown === 'visible' && this.state.category.time ? 'visible' : 'hidden',
                  }}
                />
                <label data-testid="time" id="9" onClick={this.handleCategoryChange} className="multiselect-label">
                  Tijdsverdeling
                </label>
              </div>
            </div>

            <div className="time-radio-container">
              <input
                data-testid="all-time"
                id="5"
                type="radio"
                name="time"
                value="all-time"
                required
                onChange={this.handleTimeChange}
              />
              <label>Altijd</label>
              <input
                className="time-radio-interval"
                data-testid="interval"
                id="6"
                type="radio"
                name="time"
                value="interval"
                onChange={this.handleTimeChange}
              />
              <label>Interval</label>
            </div>

            {this.state.time.interval && (
              <div className="interval-fields" data-testid="date-fields">
                <input
                  className="interval-date"
                  data-testid="start-date"
                  id="7"
                  type="date"
                  value={this.state.time.startDate}
                  onChange={this.handleTimeChange}
                  required
                />
                <label className="interval-label-start">From</label>
                <input
                  className="interval-date"
                  data-testid="end-date"
                  id="8"
                  type="date"
                  value={this.state.time.endDate}
                  onChange={this.handleTimeChange}
                  required
                />
                <label className="interval-label-end">To</label>
              </div>
            )}

            <button className="analytics-btn" data-testid="submit" type="submit">
              Verstuur
            </button>
          </form>
        </div>

        <div className={chartsContainer}>
          {this.state.errMsg && (
            <div className="error-analytics">
              <span className="fa fa-exclamation-triangle triangle-analytics" />
              <p className="error-text-analytics">{this.state.errMsg}</p>
            </div>
          )}

          {this.state.display.gender && <GenderChart results={this.state.results} />}
          {this.state.display.age && <AgeChart results={this.state.results} />}
          {this.state.display.university && <UniCityChart results={this.state.results} category={'university'} />}
          {this.state.display.city && <UniCityChart results={this.state.results} category={'city'} />}
          {this.state.display.time && <TimeChart results={this.state.results} />}
        </div>
      </div>
    );
  }
}

export default Analytics;
