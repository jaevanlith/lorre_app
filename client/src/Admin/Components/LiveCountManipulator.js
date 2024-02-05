import React, { Component } from 'react';
import api from '../../utils/API';
import '../stylesheets/Components/LiveCountManipulator.css';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

/** Class for displaying the live count */
class LiveCountManipulator extends Component {
  state = {
    count: this.props.count,
    errRetrieve: false,
    errMessage: '',
  };

  /**
   * This method retrieves the visitor count from the server
   **/
  componentDidMount() {
    api
      .get(`/users/currentCheckIns/total`)
      .then((res) => {
        this.setState({ count: res.data });
      })
      .catch(() => {
        this.setState({ errRetrieve: true });
      });
  }

  /**
   * This method is called when qr is successfully scanned and triggers a refresh of the live coount.
   **/
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.count !== this.props.count) {
      this.componentDidMount();
    }
  }

  incrLiveCount = () => {
    if (this.state.count < 500) {
      api
        .get('/users/currentCheckIns/plus')
        .then((res) => {
          this.setState({
            count: res.data,
            errMessage: '',
          });
        })
        .catch(() => {
          this.setState({ errMessage: 'Verhogen mislukt' });
        });
    } else {
      this.setState({ errMessage: 'Maximum bereikt' });
    }
  };

  decrLiveCount = () => {
    if (this.state.count > 0) {
      api
        .get('/users/currentCheckIns/minus')
        .then((res) => {
          this.setState({
            count: res.data,
            errMessage: '',
          });
        })
        .catch(() => {
          this.setState({ errMessage: 'Verlagen mislukt' });
        });
    } else {
      this.setState({ errMessage: 'Minimum bereikt' });
    }
  };

  render() {
    return (
      <div>
        {/* Display the count, progressbar and buttons when retrieve successful */}
        {!this.state.errRetrieve && (
          <div>
            <div className="circle-progress-container">
              <CircularProgressbarWithChildren
                className="circle-progress"
                value={this.state.count}
                maxValue={500}
                strokeWidth={'5'}
                styles={{
                  path: { stroke: '#0ec04a' },
                  trail: { stroke: '#7e7e7e' },
                }}
              >
                <p className="visitor-count" data-testid="num-visitors">
                  {this.state.count}
                </p>
                <p className="visitor-label">bezoekers</p>
              </CircularProgressbarWithChildren>
            </div>

            <p className="manipulator-msg" data-testid="err-message">
              {this.state.errMessage}
            </p>

            <div className="manipulate-btn-container">
              <button
                className="decr-btn manipulate-btn fa fa-minus"
                data-testid="decr-button"
                onClick={this.decrLiveCount}
              />
              <button
                className="incr-btn manipulate-btn fa fa-plus"
                data-testid="incr-button"
                onClick={this.incrLiveCount}
              />
            </div>
          </div>
        )}

        {/* Display when retrieving live count failed */}
        {this.state.errRetrieve && (
          <p className="text-center" data-testid="err-retrieve">
            Er is iets misgegaan
          </p>
        )}
      </div>
    );
  }
}

export default LiveCountManipulator;
