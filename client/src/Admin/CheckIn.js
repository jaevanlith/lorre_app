import React, { Component } from 'react';
import LiveCountManipulator from './Components/LiveCountManipulator';
import QRReader from 'react-qr-reader';
import api from './../utils/API';
import Menu from './Components/Menu';
import './stylesheets/CheckIn.css';

/**Class for check-in screen for the admin */
class CheckIn extends Component {
  state = {
    count: 0,
    status: '',
    scan: false,
    success: '',
    fail: '',
    warning: false,
  };

  /**
   * When the component mounts it calls the getStatus function which returns the current status of Lorre.
   * It sets the state.status to this value.
   */
  componentDidMount = () => {
    api
      .get('/users/lorre/getStatus')
      .then((res) => {
        this.setState({ status: res.data });
      })
      .catch(() => {
        this.setState({ errMessage: 'Er is iets misgegaan' });
      });
  };

  /**
   * This method switches the value of close to open.
   * If Lorre is open it displays a warning
   * If the warning is displayed and it is called again, Lorre will close
   */
  openAndClose = () => {
    if (this.state.status === 'open') {
      if (!this.state.warning) {
        this.setState({ warning: true });
      } else {
        api
          .post('/users/changeStatus')
          .then((res) => {
            this.setState({
              status: res.data,
              warning: false,
              fail: '',
              success: '',
            });
          })
          .catch(() => {
            this.setState({ errMessage: 'Er is iets misgegaan' });
          });
        api.post('/users/checkOutAll').catch(() => {
          this.setState({ errMessage: 'Er is iets misgegaan' });
        });
      }
    } else {
      api
        .post('/users/changeStatus')
        .then((res) => {
          this.setState({
            status: res.data,
            fail: '',
            success: '',
          });
        })
        .catch(() => {
          this.setState({ errMessage: 'Er is iets misgegaan' });
        });
    }
  };

  /**
   * This method hides/displays scanner/result.
   */
  showReader = () => {
    this.setState({
      scan: !this.state.scan,
      fail: '',
      success: '',
    });
  };

  /**Sets warnig to false */
  handelCancel = () => {
    this.setState({ warning: false });
  };
  /**
   * This method sends a scanned ticket id to the server and displays result.
   */
  handleScan = (data) => {
    if (data) {
      api
        .get('/tickets/verify/' + data)
        .then((res) => {
          if (res.data === 'Inchecken gelukt') {
            this.setState({
              count: this.state.count + 1,
              scan: false,
              success: res.data,
            });
          } else {
            this.setState({
              scan: false,
              fail: res.data,
            });
          }
        })
        .catch(() => {
          this.setState({
            scan: false,
            fail: 'Inchecken mislukt',
          });
        });
    }
  };

  /**
   * This method is called when an error occurs in the scanner.
   */
  handleError = () => {
    this.setState({
      scan: false,
      fail: 'Scannen mislukt, probeer het opnieuw',
    });
  };

  render() {
    return (
      <div data-testid="screen">
        <Menu />

        <p className="text-center">{this.state.errMessage}</p>

        {/* Display closed container, when open is false */}
        {this.state.status === 'closed' && (
          <div>
            <p className="status-label">Status</p>
            <div data-testid="closed-container" className="status-container">
              <div data-testid="open-btn" className="status-open-container disabled" onClick={this.openAndClose}>
                <span className="status-icon fa fa-check-circle" />
                <p data-testid="open" className="status-text">
                  OPEN
                </p>
              </div>
              <div className="status-closed-container enabled-close">
                <span className="status-icon fa fa-times-circle" />
                <p data-testid="closed" className="status-text">
                  DICHT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display open container, when open is true */}
        {this.state.status === 'open' && (
          <div data-testid="open-container">
            <p className="status-label">Status</p>
            <div className="status-container">
              <div className="status-open-container enabled-open">
                <span className="status-icon fa fa-check-circle" />
                <p className="status-text">OPEN</p>
              </div>
              <div data-testid="close-btn" className="status-closed-container disabled" onClick={this.openAndClose}>
                <span className="status-icon fa fa-times-circle" />
                <p className="status-text">DICHT</p>
              </div>
            </div>
            {this.state.warning && (
              <div data-testid="close-warning" className="close-warning">
                <span className="close-warning-icon fa fa-exclamation-triangle fa-2x" />
                <p className="close-warning-text">Als je Lorre sluit dan worden alle bezoekers uitgecheckt.</p>
                <div>
                  <button className="warning-cancel-btn" data-testid="close-cancel" onClick={this.handelCancel}>
                    Annuleren
                  </button>
                  <button className="warning-ok-btn" data-testid="close-confirm" onClick={this.openAndClose}>
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Component to manipulate live count */}
            <p className="manipulator-label">Handmatig inchecken</p>
            <div className="checkin-tool-container">
              <LiveCountManipulator count={this.state.count} />
            </div>

            <p className="scan-label">QR-code scannen</p>
            <div className="checkin-tool-container scan-container">
              {/* Display result of scanned QR code */}
              {!this.state.scan && (
                <div data-testid="qr-result">
                  {this.state.fail && (
                    <div className="scan-fail-msg">
                      <span className="fa fa-times" />
                      <p className="scan-msg-text">{this.state.fail}</p>
                    </div>
                  )}

                  {this.state.success && (
                    <div className="scan-success-msg">
                      <span className="fa fa-check" />
                      <p className="scan-msg-text">{this.state.success}</p>
                    </div>
                  )}
                  <button className="scan-btn" data-testid="start-scan-button" onClick={this.showReader}>
                    <span className="qr-icon fa fa-qrcode" />
                    <p className="scan-text">Start scanner</p>
                  </button>
                </div>
              )}

              {/* The component that reads the QR code */}
              {this.state.scan && (
                <div className="qr-reader-container" data-testid="qr-reader">
                  <QRReader
                    delay={300}
                    onError={this.handleError}
                    onScan={this.handleScan}
                    style={{ width: '100%', marginTop: '20px' }}
                  />
                  <button className="scan-btn" data-testid="stop-scan-button" onClick={this.showReader}>
                    <span className="qr-icon fa fa-qrcode" />
                    <p className="scan-text">Stop scanner</p>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CheckIn;
